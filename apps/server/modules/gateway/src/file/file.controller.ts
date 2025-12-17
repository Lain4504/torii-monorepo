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
import {ApiParam, ApiQuery} from "@nestjs/swagger";

@Controller('api')
export class FileController {
  constructor(private readonly fileService: FileService) { }

  @Get('fileUpload')
  async checkChunk(@Query() query: any, @Res() res: Response) {
    // Resumable.js Check
    const exists = await this.fileService.checkChunk(query);
    if (exists) {
      return res.status(HttpStatus.OK).send('OK');
    }
    return res.status(HttpStatus.NO_CONTENT).send('Not Found');
  }

  @Post('fileUpload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadChunk(@Query() query: any, @UploadedFile() file: any) {
    return this.fileService.handleUploadChunk(query, file);
  }

  @Post('uploadedFileMerge')
  async mergeFile(@Body() body: any) {
    return this.fileService.mergeFile(body);
  }

  @Post('uploadBase64EncodedData')
  @ApiParam({ name: 'sid', required: true })
  @ApiQuery({ name: 'filename', required: true })
  async uploadBase64EncodedData(@Body() body: any) {
    // This will need implementation in fileService
    // For now we just forward or handle it
    return { status: false, msg: 'Not implemented' };
  }

  @Post('getRoomFilesByType')
  async getRoomFilesByType(@Body() body: any) {
    // This will need implementation in fileService
    return { status: false, msg: 'Not implemented' };
  }

  @Get('/download/uploadedFile/:sid/*')
  async downloadFile(
      @Param('sid') sid: string,
      @Query('filename') filename: string,
      @Res() res: Response,
  ) {
    const fullPath = this.fileService.getFilePath(sid, filename);
    if (fs.existsSync(fullPath)) {
      return res.download(fullPath);
    }
    return res.status(HttpStatus.NOT_FOUND).send('File not found');
  }
}

