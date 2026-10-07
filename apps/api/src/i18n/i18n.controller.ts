import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';

@Controller('i18n')
export class I18nController {
  @Get(':lang')
  getLanguage(@Param('lang') lang: string) {
    const code = (lang || 'tr').toLowerCase().replace(/[^a-z-]/g, '');
    const candidates = [
      // nest-cli copies assets next to compiled controllers under dist/
      join(__dirname, '..', 'modules', 'i18n', 'fallbacks', `${code}.json`),
      join(process.cwd(), 'src', 'modules', 'i18n', 'fallbacks', `${code}.json`),
      join(process.cwd(), 'apps', 'api', 'src', 'modules', 'i18n', 'fallbacks', `${code}.json`),
    ];

    for (const file of candidates) {
      try {
        const raw = readFileSync(file, 'utf8');
        return JSON.parse(raw);
      } catch {
        // try next candidate
      }
    }

    throw new NotFoundException(`Language ${code} not found`);
  }
}
