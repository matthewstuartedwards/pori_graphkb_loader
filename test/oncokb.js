const { parseVariantName } = require('../src/knowledgebases/oncokb');


describe('oncokb', () => {
    describe('parseVariantName', () => {
        test.todo('parses exon mutations');

        test.todo('kinase domain duplication');

        test.todo('amplification');

        test.todo('wildtype');

        test.todo('adds p prefix (T790M)');

        test('fusion', () => {
            const parsed = parseVariantName('BCR-ABL1 Fusion');
            expect(parsed).toEqual({
                reference2: 'abl1',
                type: 'fusion',
            });
        });

        test('fusion with gene given', () => {
            const parsed = parseVariantName('BCR-ABL1 Fusion', { reference1: 'ABL1' });
            expect(parsed).toEqual({
                reference1: 'bcr',
                reference2: 'abl1',
                type: 'fusion',
            });
        });
    });
});
