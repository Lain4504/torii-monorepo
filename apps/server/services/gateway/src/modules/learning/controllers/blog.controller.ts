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
    PermissionsGuard,
    Permissions,
    ReqWithRequester,
} from '@server/shared';

@Controller('api/blogs')
@UseGuards(GatewayAuthGuard, PermissionsGuard)
export class BlogController {
    constructor(@Inject('NATS_SERVICE') private readonly natsClient: ClientProxy) { }

    @Public()
    @Get()
    async findAllBlogs(@Query() query: any, @Req() req: ReqWithRequester) {
        const permissions = req.requester?.permissions || [];
        const hasPrivilege = permissions.includes('*') || permissions.includes('blog.view_restricted') || permissions.includes('blog.manage');

        // Only allow showScheduled if user has privilege
        const showScheduled = query.showScheduled === 'true' && hasPrivilege;

        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.blog.findAll' },
                    { ...query, showScheduled }
                )
            );
            return successPaginatedResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch blogs');
        }
    }

    @Get('admin')
    @Permissions('blog.view_restricted', 'blog.manage')
    async findAllAdmin(@Query() query: any) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.blog.findAll' },
                    { ...query, showScheduled: true }
                )
            );
            return successPaginatedResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch blogs');
        }
    }

    @Public()
    @Get('slug/:slug')
    async findBlogBySlug(@Param('slug') slug: string, @Req() req: ReqWithRequester) {
        const permissions = req.requester?.permissions || [];
        const hasPrivilege = permissions.includes('*') || permissions.includes('blog.view_restricted') || permissions.includes('blog.manage');

        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.blog.findBySlug' },
                    { slug, showScheduled: hasPrivilege }
                )
            );
            return successResponse({ blog: result });
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch blog');
        }
    }

    @Public()
    @Get(':id')
    async findBlogById(@Param('id') id: string, @Req() req: ReqWithRequester) {
        const permissions = req.requester?.permissions || [];
        const hasPrivilege = permissions.includes('*') || permissions.includes('blog.view_restricted') || permissions.includes('blog.manage');

        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.blog.findById' },
                    { id, showScheduled: hasPrivilege }
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
    @Permissions('blog.create', 'blog.manage')
    async createPost(@Body() dto: any, @Req() req: ReqWithRequester) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.blog.create' },
                    { ...dto, requester: req.requester }
                )
            );
            return successResponse({ blog: result }, 'Blog created successfully');
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to create blog');
        }
    }

    @Patch(':id')
    @Permissions('blog.update', 'blog.manage')
    async updateBlog(@Param('id') id: string, @Body() dto: any, @Req() req: ReqWithRequester) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.blog.update' },
                    { id, dto, requester: req.requester }
                )
            );
            return successResponse({ blog: result }, 'Blog updated successfully');
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to update blog');
        }
    }

    @Delete(':id')
    @Permissions('blog.delete', 'blog.manage')
    async deleteBlog(@Param('id') id: string, @Req() req: ReqWithRequester) {
        try {
            await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.blog.delete' },
                    { id, requester: req.requester }
                )
            );
            return successResponse(null, 'Blog deleted successfully');
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to delete blog');
        }
    }

    @Patch(':id/publish')
    @Permissions('blog.publish', 'blog.manage')
    async publishBlog(@Param('id') id: string, @Req() req: ReqWithRequester) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.blog.publish' },
                    { id, requester: req.requester }
                )
            );
            return successResponse({ blog: result }, 'Blog published successfully');
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to publish blog');
        }
    }
}
