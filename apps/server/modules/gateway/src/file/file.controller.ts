import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UploadedFile,
  UseInterceptors,
  Res,
  Param,
  Req,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from './file.service';
import type { Response } from 'express';
import * as fs from 'fs';

@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Get('upload')
  async checkChunk(@Query() query: any, @Res() res: Response) {
    // Resumable.js Check
    const exists = await this.fileService.checkChunk(query);
    if (exists) {
      return res.status(HttpStatus.OK).send('OK');
    }
    return res.status(HttpStatus.NO_CONTENT).send('Not Found');
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadChunk(@Query() query: any, @UploadedFile() file: any) {
    return this.fileService.handleUploadChunk(query, file);
  }

  @Post('merge')
  async mergeFile(@Body() body: any) {
    return this.fileService.mergeFile(body);
  }

  @Get('download/:sid/*')
  async downloadFile(
    @Param('sid') sid: string,
    @Param('0') filename: string,
    @Res() res: Response,
  ) {
    const fullPath = this.fileService.getFilePath(sid, filename);
    if (fs.existsSync(fullPath)) {
      return res.download(fullPath);
    }
    return res.status(HttpStatus.NOT_FOUND).send('File not found');
  }
}
