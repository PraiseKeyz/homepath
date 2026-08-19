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

// Every service/controller returns { data?, message? }:
//   data    → the actual payload
//   message → human-readable description of what happened
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((payload) => ({
        success: true,
        message: payload?.message ?? 'Request successful',
        data: payload?.data ?? payload ?? null,
        error: null,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
