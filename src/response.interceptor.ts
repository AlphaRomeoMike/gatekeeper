import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { catchError, map, Observable, throwError } from 'rxjs';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      map((data) => {
        if (request?.method === 'POST') {
          return {
            message: 'Created',
            data,
            statusCode: response?.statusCode,
          };
        }

        if (request?.method === 'GET') {
          return {
            message: 'Fetched',
            data,
            statusCode: response?.statusCode,
          };
        }
        return data;
      }),

      catchError((error) => {
        if (error instanceof HttpException) {
          if (error.getStatus()) {
            return throwError(() => {
              return new HttpException(error.getResponse(), error.getStatus());
            });
          }
          return throwError(() => error);
        }
        return next.handle();
      }),
    );
  }
}
