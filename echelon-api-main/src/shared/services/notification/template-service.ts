import { Injectable } from '@nestjs/common'
import { ITemplateService } from '../interfaces/notification'

@Injectable()
export class TemplateService implements ITemplateService {
    async fetchTemplate(templateUrl: string): Promise<string> {
        const response = await fetch(templateUrl)
        return await response.text()
    }
}
