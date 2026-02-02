/**
 * Recording Controller (Gateway)
 *
 * Handles recording-related API endpoints via Gateway -> NATS -> Meet Service
 * Match Go server: pkg/controllers/recording.go
 */

import {
    Controller,
    Post,
    Body,
    Res,
    UseGuards,
    HttpCode,
    HttpStatus,
    Inject,
} from '@nestjs/common';
import type { Response } from 'express';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { create } from '@bufbuild/protobuf';
import {
    FetchRecordingsReq,
    FetchRecordingsReqSchema,
    FetchRecordingsRes,
    FetchRecordingsResSchema,
    RecordingInfoReq,
    RecordingInfoReqSchema,
    UpdateRecordingMetadataReq,
    UpdateRecordingMetadataReqSchema,
    DeleteRecordingReq,
    DeleteRecordingReqSchema,
    GetDownloadTokenReq,
    GetDownloadTokenReqSchema,
    GetDownloadTokenRes,
    GetDownloadTokenResSchema,
} from '@workspace/protocol';
import {
    sendCommonProtoJsonResponse,
    sendProtoJsonResponse,
    parseAndValidateRequest,
    ApiKeyGuard,
} from '@server/shared';

/**
 * RecordingController handles recording management operations (ApiKeyGuard routes)
 * Routes under /auth/recording
 */
@Controller('auth/recording')
@UseGuards(ApiKeyGuard)
export class RecordingController {
    constructor(
        @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
    ) { }

    /**
     * HandleFetchRecordings fetches a list of recordings
     * Match Go: HandleFetchRecordings
     * @route POST /auth/recording/fetch
     */
    @Post('fetch')
    @HttpCode(HttpStatus.OK)
    async handleFetchRecordings(
        @Body() body: any,
        @Res() res: Response,
    ): Promise<void> {
        let request: FetchRecordingsReq;
        try {
            request = parseAndValidateRequest<FetchRecordingsReq>(
                body,
                FetchRecordingsReqSchema,
            );
        } catch (error) {
            sendCommonProtoJsonResponse(res, false, error instanceof Error ? error.message : 'Invalid request');
            return;
        }

        try {
            const result = await firstValueFrom(
                this.natsClient.send({ cmd: 'recording.fetch' }, request),
            );

            if (Number(result.totalRecordings) === 0) {
                sendCommonProtoJsonResponse(res, false, 'no recordings found');
                return;
            }

            const response = create(FetchRecordingsResSchema, {
                status: true,
                msg: 'success',
                result: result,
            });

            res.status(200);
            sendProtoJsonResponse(res, FetchRecordingsResSchema, response);
        } catch (error) {
            sendCommonProtoJsonResponse(res, false, error instanceof Error ? error.message : 'Error fetching recordings');
        }
    }

    /**
     * HandleRecordingInfo gets information about a recording
     * Match Go: HandleRecordingInfo
     * @route POST /auth/recording/info
     */
    @Post('info')
    @HttpCode(HttpStatus.OK)
    async handleRecordingInfo(
        @Body() body: any,
        @Res() res: Response,
    ): Promise<void> {
        let request: RecordingInfoReq;
        try {
            request = parseAndValidateRequest<RecordingInfoReq>(
                body,
                RecordingInfoReqSchema,
            );
        } catch (error) {
            sendCommonProtoJsonResponse(res, false, error instanceof Error ? error.message : 'Invalid request');
            return;
        }

        try {
            const result = await firstValueFrom(
                this.natsClient.send({ cmd: 'recording.info' }, request),
            );
            res.status(200);
            sendProtoJsonResponse(res, result.$typeName, result);
        } catch (error) {
            sendCommonProtoJsonResponse(res, false, error instanceof Error ? error.message : 'Error getting recording info');
        }
    }

    /**
     * HandleUpdateRecordingMetadata updates recording metadata
     * Match Go: HandleUpdateRecordingMetadata
     * @route POST /auth/recording/updateMetadata
     */
    @Post('updateMetadata')
    @HttpCode(HttpStatus.OK)
    async handleUpdateRecordingMetadata(
        @Body() body: any,
        @Res() res: Response,
    ): Promise<void> {
        let request: UpdateRecordingMetadataReq;
        try {
            request = parseAndValidateRequest<UpdateRecordingMetadataReq>(
                body,
                UpdateRecordingMetadataReqSchema,
            );
        } catch (error) {
            sendCommonProtoJsonResponse(res, false, error instanceof Error ? error.message : 'Invalid request');
            return;
        }

        try {
            await firstValueFrom(
                this.natsClient.send({ cmd: 'recording.updateMetadata' }, request),
            );
            sendCommonProtoJsonResponse(res, true, 'success');
        } catch (error) {
            sendCommonProtoJsonResponse(res, false, error instanceof Error ? error.message : 'Error updating recording metadata');
        }
    }

    /**
     * HandleDeleteRecording deletes a recording
     * Match Go: HandleDeleteRecording
     * @route POST /auth/recording/delete
     */
    @Post('delete')
    @HttpCode(HttpStatus.OK)
    async handleDeleteRecording(
        @Body() body: any,
        @Res() res: Response,
    ): Promise<void> {
        let request: DeleteRecordingReq;
        try {
            request = parseAndValidateRequest<DeleteRecordingReq>(
                body,
                DeleteRecordingReqSchema,
            );
        } catch (error) {
            sendCommonProtoJsonResponse(res, false, error instanceof Error ? error.message : 'Invalid request');
            return;
        }

        try {
            await firstValueFrom(
                this.natsClient.send({ cmd: 'recording.delete' }, request),
            );
            sendCommonProtoJsonResponse(res, true, 'success');
        } catch (error) {
            sendCommonProtoJsonResponse(res, false, error instanceof Error ? error.message : 'Error deleting recording');
        }
    }

    /**
     * HandleGetDownloadToken generates a download token
     * Match Go: HandleGetDownloadToken
     * @route POST /auth/recording/getDownloadToken
     */
    @Post('getDownloadToken')
    @HttpCode(HttpStatus.OK)
    async handleGetDownloadToken(
        @Body() body: any,
        @Res() res: Response,
    ): Promise<void> {
        let request: GetDownloadTokenReq;
        try {
            request = parseAndValidateRequest<GetDownloadTokenReq>(
                body,
                GetDownloadTokenReqSchema,
            );
        } catch (error) {
            sendCommonProtoJsonResponse(res, false, error instanceof Error ? error.message : 'Invalid request');
            return;
        }

        try {
            const result = await firstValueFrom(
                this.natsClient.send({ cmd: 'recording.getDownloadToken' }, request),
            );

            const response = create(GetDownloadTokenResSchema, {
                status: true,
                msg: 'success',
                token: result.token,
            });

            res.status(200);
            sendProtoJsonResponse(res, GetDownloadTokenResSchema, response);
        } catch (error) {
            sendCommonProtoJsonResponse(res, false, error instanceof Error ? error.message : 'Error generating download token');
        }
    }
}
