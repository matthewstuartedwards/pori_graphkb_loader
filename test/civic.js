const kbParser = require('@bcgsc/knowledgebase-parser');


const {getVariantName} = require('./../src/civic');


describe('civic', () => {
    describe('getVariantName', () => {
        test('parses exon mutations', () => {
            const parsedName = getVariantName({name: 'EXON 12 MUTATION'});
            expect(parsedName).toBe('e.12mut');
            // external parser should not throw error
            expect(() => {
                kbParser.variant.parse(parsedName, false).toJSON();
            }).not.toThrow();
        });
        test.skip('handles gene name included', () => {
            // jak2 f694l
        });
        test.skip('handles cds notation in parentheses', () => {
            // s65l (c.194c>t)
            // E70K (c.208G>A)
            // r167p (c.500g>c)
        });
        test('deleterious mutation', () => {
            const parsedName = getVariantName({name: 'DELETERIOUS MUTATION'});
            expect(parsedName).toBe('deleterious mutation');
        });
        test('phos variant', () => {
            const parsedName = getVariantName({name: 'Y1234 phosphorylation'});
            expect(parsedName).toBe('p.y1234phos');
        });
    });
    describe('processVariant', () => {

    });
});
