import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { BlogService } from '@server/learning/modules/blog/blog.service';
import { BlogCreateDTO, BlogUpdateDTO, BlogQueryDTO } from '@workspace/schemas';

@Controller()
export class BlogHandler {
    constructor(private readonly blogService: BlogService) { }

    @MessagePattern({ cmd: 'learning.blog.findAll' })
    async findAll(@Payload() query: BlogQueryDTO) {
        return this.blogService.findAllBlogs(query);
    }

    @MessagePattern({ cmd: 'learning.blog.findBySlug' })
    async findBySlug(@Payload() data: { slug: string }) {
        return this.blogService.findBlogBySlug(data.slug);
    }

    @MessagePattern({ cmd: 'learning.blog.findById' })
    async findById(@Payload() data: { id: string }) {
        return this.blogService.findBlogById(data.id);
    }

    @MessagePattern({ cmd: 'learning.blog.incrementView' })
    async incrementView(@Payload() data: { id: string, ip?: string }) {
        return this.blogService.incrementViewCount(data.id, data.ip);
    }

    @MessagePattern({ cmd: 'learning.blog.create' })
    async create(@Payload() data: BlogCreateDTO) {
        return this.blogService.createBlog(data);
    }

    @MessagePattern({ cmd: 'learning.blog.update' })
    async update(@Payload() data: { id: string, dto: BlogUpdateDTO }) {
        return this.blogService.updateBlog(data.id, data.dto);
    }

    @MessagePattern({ cmd: 'learning.blog.delete' })
    async delete(@Payload() data: { id: string }) {
        return this.blogService.deleteBlog(data.id);
    }

    @MessagePattern({ cmd: 'learning.blog.publish' })
    async publish(@Payload() data: { id: string }) {
        return this.blogService.publishBlog(data.id);
    }


}

