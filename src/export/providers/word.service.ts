import { Inject, Injectable } from '@nestjs/common';
import * as docx from 'docx';
import * as fs from 'fs';

import { Helper } from '@webilix/helper-library';
import { JalaliDateTime } from '@webilix/jalali-date-time';

import { IExportConfig, IExportHeader, IExportOptions, IExportTable } from '../export.interface';
import { ExportColumn, ExportColumnEnum } from '../export.type';

@Injectable()
export class ExportWordService {
    constructor(@Inject('EXPORT_CONFIG') private readonly config: IExportConfig) {}

    private noBorder: docx.ITableCellBorders = {
        top: { style: docx.BorderStyle.NONE },
        left: { style: docx.BorderStyle.NONE },
        right: { style: docx.BorderStyle.NONE },
        bottom: { style: docx.BorderStyle.NONE },
    };

    private getTextRun = (
        text: string,
        config?: Partial<{ color: string; font: string; size: number; bold: boolean; newLine: boolean }>,
    ): docx.TextRun =>
        new docx.TextRun({
            text,
            color: config?.color || this.config.textColor,
            font: config?.font || this.config.fontFA,
            size: config?.size || 20,
            bold: config?.bold || false,
            boldComplexScript: config?.bold || false,
            break: config?.newLine ? 1 : 0,
        });

    private getParagraph = (
        alignment: (typeof docx.AlignmentType)[keyof typeof docx.AlignmentType],
        children: docx.ParagraphChild[],
    ): docx.Paragraph => new docx.Paragraph({ alignment, bidirectional: true, children });

    private getTH = (text: string): docx.TableCell =>
        new docx.TableCell({
            shading: { color: this.config.backgroundColor, type: docx.ShadingType.SOLID },
            verticalAlign: docx.VerticalAlign.CENTER,
            borders: {
                top: { style: docx.BorderStyle.SINGLE, size: 1, color: this.config.backgroundColor },
                right: { style: docx.BorderStyle.SINGLE, size: 1, color: this.config.backgroundColor },
                bottom: { style: docx.BorderStyle.SINGLE, size: 1, color: this.config.backgroundColor },
                left: { style: docx.BorderStyle.SINGLE, size: 1, color: this.config.backgroundColor },
            },
            margins: { top: 100, right: 100, bottom: 100, left: 100 },
            children: [
                this.getParagraph('left', [this.getTextRun(text, { bold: true, color: this.config.foregroundColor })]),
            ],
        });

    private getTD = (text: string, column: ExportColumn): docx.TableCell => {
        const english: boolean = ExportColumnEnum[column.type].docx.english(column);

        return new docx.TableCell({
            verticalAlign: docx.VerticalAlign.TOP,
            borders: {
                top: { style: docx.BorderStyle.SINGLE, size: 1, color: this.config.backgroundColor },
                right: { style: docx.BorderStyle.SINGLE, size: 1, color: this.config.backgroundColor },
                bottom: { style: docx.BorderStyle.SINGLE, size: 1, color: this.config.backgroundColor },
                left: { style: docx.BorderStyle.SINGLE, size: 1, color: this.config.backgroundColor },
            },
            margins: { top: 50, right: 100, bottom: 50, left: 100 },
            children: [
                this.getParagraph(
                    english ? 'right' : 'left',
                    text.split('\n').map((line: string, index: number) =>
                        this.getTextRun(line, {
                            size: 18,
                            newLine: index !== 0,
                            font: english ? this.config.fontEN : this.config.fontFA,
                        }),
                    ),
                ),
            ],
        });
    };

    private getLogo = (image?: string): docx.TableCell | undefined =>
        Helper.IS.empty(image)
            ? undefined
            : new docx.TableCell({
                  verticalAlign: docx.VerticalAlign.CENTER,
                  borders: { ...this.noBorder },
                  margins: { top: 0, right: 0, bottom: 100, left: 0 },
                  children: [
                      this.getParagraph('center', [
                          new docx.ImageRun({
                              data: fs.readFileSync(image || ''),
                              transformation: { width: 50, height: 50 },
                          }),
                      ]),
                  ],
              });

    private getDescription = (description?: string): docx.Paragraph | undefined =>
        !description
            ? undefined
            : this.getParagraph('left', [
                  this.getTextRun(description, {
                      bold: true,
                      color: this.config.backgroundColor,
                  }),
              ]);

    private getHeader = (headers: IExportHeader[] = []): docx.Table | undefined =>
        headers.length === 0
            ? undefined
            : new docx.Table({
                  visuallyRightToLeft: true,
                  width: { size: 100, type: docx.WidthType.PERCENTAGE },
                  rows: headers.map(
                      (h) =>
                          new docx.TableRow({
                              children: [
                                  new docx.TableCell({
                                      borders: { ...this.noBorder },
                                      margins: { top: 0, right: 0, bottom: 0, left: 0 },
                                      children: [
                                          this.getParagraph('left', [
                                              this.getTextRun(`${h.title}: `, {
                                                  bold: true,
                                                  color: this.config.backgroundColor,
                                              }),
                                              this.getTextRun(h.value, {
                                                  color: this.config.backgroundColor,
                                                  font: h.english ? this.config.fontEN : this.config.fontFA,
                                              }),
                                          ]),
                                      ],
                                  }),
                              ],
                          }),
                  ),
              });

    private getWidth = (table: IExportTable): number[] => {
        const size: number[] = table.columns.map((c) => c.title.length);
        table.columns.map((c, index: number) => {
            table.rows.forEach((r) => {
                const length: number = ExportColumnEnum[c.type].width(r[c.id], c);
                if (length > size[index]) size[index] = length;
            });
        });

        const sum: number = size.reduce((sum: number, s) => sum + s, 0);
        const width: number[] = size.map((s) => 5 + Math.floor((s / sum) * 95));
        while (width.reduce((sum: number, w) => sum + w, 0) > 100) width[width.indexOf(Math.max(...width))]--;
        while (width.reduce((sum: number, w) => sum + w, 0) < 100) width[width.indexOf(Math.min(...width))]++;

        return width;
    };

    export(path: string, table: IExportTable, options?: IExportOptions): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            try {
                const styles: docx.IStylesOptions = {
                    default: {
                        document: {
                            paragraph: { spacing: { before: 0, after: 0 } },
                            run: { font: this.config.fontFA, rightToLeft: true, size: 20 },
                        },
                    },
                };

                const th: docx.TableRow = new docx.TableRow({
                    children: table.columns.map((c) => this.getTH(c.title)),
                    tableHeader: true,
                });
                const td: docx.TableRow[] = table.rows.map((r) => {
                    return new docx.TableRow({
                        children: table.columns.map((c) => this.getTD(ExportColumnEnum[c.type].docx.value(r[c.id], c), c)),
                        cantSplit: true,
                    });
                });

                const header: docx.Header = new docx.Header({
                    children: [
                        new docx.Table({
                            visuallyRightToLeft: true,
                            width: { size: 100, type: docx.WidthType.PERCENTAGE },
                            columnWidths: this.config.logo ? [7, 70, 23] : [70, 30],
                            rows: [
                                new docx.TableRow({
                                    children: (
                                        [
                                            this.getLogo(this.config.logo),
                                            new docx.TableCell({
                                                verticalAlign: docx.VerticalAlign.CENTER,
                                                borders: { ...this.noBorder },
                                                margins: { top: 0, right: 0, bottom: 100, left: 0 },
                                                children: (
                                                    [
                                                        this.getParagraph('left', [
                                                            this.getTextRun(table.title, {
                                                                size: 28,
                                                                bold: true,
                                                                color: this.config.backgroundColor,
                                                            }),
                                                        ]),
                                                        this.getDescription(table.description),
                                                        this.getHeader(table.headers),
                                                    ] as (docx.Paragraph | docx.Table)[]
                                                ).filter((c) => c !== undefined),
                                            }),
                                            new docx.TableCell({
                                                verticalAlign: docx.VerticalAlign.BOTTOM,
                                                borders: { ...this.noBorder },
                                                margins: { top: 0, right: 0, bottom: 100, left: 0 },
                                                children: options?.hideDate
                                                    ? []
                                                    : [
                                                          this.getParagraph('right', [
                                                              this.getTextRun(
                                                                  JalaliDateTime().toTitle(new Date(), {
                                                                      format: 'W، d N Y',
                                                                  }),
                                                              ),
                                                          ]),
                                                      ],
                                            }),
                                        ] as docx.TableCell[]
                                    ).filter((c) => c !== undefined),
                                }),
                            ],
                        }),
                    ],
                });

                const footer: docx.Footer = new docx.Footer({
                    children: [
                        this.getParagraph('right', [
                            new docx.TextRun({
                                children: [docx.PageNumber.CURRENT, ' / ', docx.PageNumber.TOTAL_PAGES],
                            }),
                        ]),
                    ],
                });

                const doc = new docx.Document({
                    styles,
                    sections: [
                        {
                            properties: { page: { size: { orientation: docx.PageOrientation.LANDSCAPE } } },
                            headers: { default: header },
                            footers: { default: footer },
                            children: [
                                new docx.Table({
                                    visuallyRightToLeft: true,
                                    width: { size: 100, type: docx.WidthType.PERCENTAGE },
                                    columnWidths: this.getWidth(table),
                                    rows: [th, ...td],
                                }),
                            ],
                        },
                    ],
                });

                fs.writeFileSync(path, Buffer.from(await docx.Packer.toBuffer(doc)));
                resolve();
            } catch (e) {
                reject();
            }
        });
    }
}
