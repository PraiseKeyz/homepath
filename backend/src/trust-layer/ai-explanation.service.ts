import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';

export interface TrustScoreExplanationInput {
  score: number;
  registryStatus: 'CLEAN' | 'FLAGGED' | 'DISPUTED' | 'NOT_FOUND';
  confirmationCount: number;
  disputeCount: number;
}

const DISCLAIMER =
  'This score is not legal proof of ownership. We recommend independent legal or survey verification before making any payment.';

// AI's ONLY job here is to narrate a score that has already been computed
// deterministically (see TrustLayerService.computeTrustScore). It never
// determines the score itself and never claims to verify ownership or
// authenticate a document — see docs/ARCHITECTURE.md §2.
@Injectable()
export class AiExplanationService {
  private readonly logger = new Logger(AiExplanationService.name);
  private readonly client?: Anthropic;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('ANTHROPIC_API_KEY');
    if (apiKey) {
      this.client = new Anthropic({ apiKey });
    }
  }

  async explain(input: TrustScoreExplanationInput): Promise<string> {
    if (!this.client) {
      return `${this.fallbackSummary(input)} ${DISCLAIMER}`;
    }

    try {
      const message = await this.client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 200,
        system:
          'You narrate a property Trust Score for a Nigerian housing platform. ' +
          'You are given an already-computed score and the deterministic signals behind it ' +
          '(a registry lookup status, and counts of community confirmation/dispute reports). ' +
          'Explain the score in plain, reassuring-but-honest English in 2-3 sentences. ' +
          'You must never claim the property, document, or ownership is verified, authentic, ' +
          'or legitimate as a matter of fact — only describe what the registry and community ' +
          'signals show. Always end with this exact sentence: ' +
          `"${DISCLAIMER}"`,
        messages: [
          {
            role: 'user',
            content: JSON.stringify(input),
          },
        ],
      });

      const textBlock = message.content.find((block) => block.type === 'text');
      return textBlock?.text ?? `${this.fallbackSummary(input)} ${DISCLAIMER}`;
    } catch (error) {
      this.logger.warn(`Claude explanation failed, using fallback: ${error}`);
      return `${this.fallbackSummary(input)} ${DISCLAIMER}`;
    }
  }

  private fallbackSummary(input: TrustScoreExplanationInput): string {
    const registryLine =
      input.registryStatus === 'CLEAN'
        ? 'This plot matches a clean registry record.'
        : input.registryStatus === 'NOT_FOUND'
          ? 'No registry record was found for this plot — this means unverified, not clean.'
          : 'This plot matches a flagged or disputed registry record.';

    const communityLine =
      input.confirmationCount === 0 && input.disputeCount === 0
        ? 'No community reports have been filed yet.'
        : `${input.confirmationCount} confirmation report(s) and ${input.disputeCount} dispute/fraud report(s) have been filed by the community.`;

    return `Trust Score: ${input.score}/100. ${registryLine} ${communityLine}`;
  }
}
