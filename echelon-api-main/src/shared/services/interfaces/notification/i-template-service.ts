export interface ITemplateService {
    fetchTemplate(templateUrl: string): Promise<string>
}
