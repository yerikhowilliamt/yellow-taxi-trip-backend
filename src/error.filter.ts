import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';

@Catch(HttpException)
export class ErrorFilter implements ExceptionFilter {
  catch(exception: HttpException | any, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const responseBody = exception.getResponse();
      response.status(status).json({
        errors: responseBody,
      });
    } else {
      response.status(500).json({
        errors: exception.message,
      });
    }
  }
}