import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  error: null;
  timestamp: string;
}

// Every controller method returns { data, message? } — this is the one place
// that shape gets wrapped into the envelope every response actually sends.
interface ControllerResponse<T> {
  data: T | null;
  message?: string;
}

@Injectable()
export class TransformInterceptor<T = unknown> implements NestInterceptor<
  ControllerResponse<T>,
  ApiResponse<T>
> {
  intercept(
    _context: ExecutionContext,
    next: CallHandler<ControllerResponse<T>>,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((payload) => ({
        success: true,
        message: payload.message ?? 'Request successful',
        data: payload.data ?? null,
        error: null,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
