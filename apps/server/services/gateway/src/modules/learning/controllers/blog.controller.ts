import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    Req,
    Inject,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
    successResponse,
    errorResponse,
    successPaginatedResponse,
    Public,
    GatewayAuthGuard,
    ReqWithRequester,
} from '@server/shared';

@Controller('api/blogs')
@UseGuards(GatewayAuthGuard)
export class BlogController {
    constructor(@Inject('NATS_SERVICE') private readonly natsClient: ClientProxy) { }

    @Public()
    @Get()
    async findAllBlogs(@Query() query: any) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.blog.findAll' },
                    query
                )
            );
            return successPaginatedResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch blogs');
        }
    }

    @Public()
    @Get('slug/:slug')
    async findBlogBySlug(@Param('slug') slug: string) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.blog.findBySlug' },
                    { slug }
                )
            );
            return successResponse({ blog: result });
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch blog');
        }
    }

    @Public()
    @Get(':id')
    async findBlogById(@Param('id') id: string) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.blog.findById' },
                    { id }
                )
            );
            return successResponse({ blog: result });
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch blog');
        }
    }

    @Public()
    @Patch(':id/view')
    async incrementViewCount(@Param('id') id: string, @Req() req: ReqWithRequester) {
        try {
            const ip = req.ip || req.socket.remoteAddress || 'unknown';
            await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.blog.incrementView' },
                    { id, ip }
                )
            );
            return successResponse(null, 'View count incremented');
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to increment view count');
        }
    }

    @Post()
    async createPost(@Body() dto: any, @Req() req: ReqWithRequester) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.blog.create' },
                    dto
                )
            );
            return successResponse({ blog: result }, 'Blog created successfully');
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to create blog');
        }
    }

    @Patch(':id')
    async updateBlog(@Param('id') id: string, @Body() dto: any) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.blog.update' },
                    { id, dto }
                )
            );
            return successResponse({ blog: result }, 'Blog updated successfully');
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to update blog');
        }
    }

    @Delete(':id')
    async deleteBlog(@Param('id') id: string) {
        try {
            await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.blog.delete' },
                    { id }
                )
            );
            return successResponse(null, 'Blog deleted successfully');
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to delete blog');
        }
    }

    @Patch(':id/publish')
    async publishBlog(@Param('id') id: string) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.blog.publish' },
                    { id }
                )
            );
            return successResponse({ blog: result }, 'Blog published successfully');
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to publish blog');
        }
    }
}
