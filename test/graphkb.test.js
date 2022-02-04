const { simplifyRecordsLinks, shouldUpdate } = require('../src/graphkb');

describe('shouldUpdate', () => {
    test('test for disease object', () => {
        const model = 'disease';
        const originalContent = {
            '@class': 'Disease',
            '@rid': '#133:8',
            alias: true,
            createdAt: 1565314461881,
            createdBy: '#29:0',
            deprecated: false,
            description: 'congenital abnormality characterized by the presence of only one kidney.',
            displayName: 'congenital single kidney [c101220]',
            history: '#135:28899',
            in_AliasOf: [
                '#67:21022',
                '#66:23',
            ],
            name: 'congenital single kidney',
            out_AliasOf: [
                '#66:31991',
            ],
            source: '#40:3',
            sourceId: 'c101220',
            updatedAt: 1594438640025,
            updatedBy: '#29:0',
            url: 'http://ncicb.nci.nih.gov/xml/owl/evs/thesaurus.owl#c101220',
            uuid: '709eb34b-27ff-42f5-be0c-9051c639deb0',
        };
        originalContent.source = {
            '@class': 'Source',
            '@rid': '#40:3',
            createdAt: 1565314457745,
            createdBy: '#29:0',
            description: 'nci thesaurus (ncit) provides reference terminology for many nci and other systems. it covers vocabulary for clinical care, translational and basic research, and public information and administrative activities.',
            displayName: 'NCIt',
            longName: 'nci thesaurus',
            name: 'ncit',
            sort: 2,
            updatedAt: 1565314457745,
            updatedBy: '#29:0',
            url: 'https://ncit.nci.nih.gov/ncitbrowser',
            usage: 'https://creativecommons.org/licenses/by/4.0',
            uuid: 'dad84739-b1e3-4686-b055-6bc3c3de9bc3',
        };
        const newContent = { ...originalContent };
        newContent.name = 'a new name';
        newContent.displayName = 'a new display name';
        const excludedFieldsExhaustive = ['name', 'displayName'];
        const excludedFieldsNonExhaustive = ['name'];

        expect(shouldUpdate(
            model,
            originalContent,
            newContent,
            excludedFieldsNonExhaustive,
        )).toBe(true);

        expect(shouldUpdate(
            model,
            originalContent,
            newContent,
            excludedFieldsExhaustive,
        )).toBe(false);

        newContent.source.name = 'a new source name';
        expect(shouldUpdate(
            model,
            originalContent,
            newContent,
            excludedFieldsExhaustive,
        )).toBe(false);
    });

    test('test for statement object', () => {
        const model = 'statement';
        const originalContent = {
            '@class': 'Statement',
            '@rid': '#153:0',
            conditions: [
                '#159:5192',
                '#135:9855',
            ],
            createdAt: 1565629092399,
            createdBy: '#29:0',
            description: 'Young AML patients (<60 years old) with DNMT3A mutations...',
            displayNameTemplate: '{conditions:variant} {relevance} of {subject} ({evidence})',
            evidence: [
                '#118:774',
            ],
            evidenceLevel: [
                '#106:3',
            ],
            history: '#156:12546',
            relevance: '#148:2',
            reviewStatus: 'not required',
            source: '#38:1',
            sourceId: '4',
            subject: '#135:9855',
            updatedAt: 1611496856338,
            updatedBy: '#29:0',
            uuid: '543616c6-c259-4c4e-ab4e-31434221f259',
        };
        originalContent.source = {
            '@class': 'Source',
            '@rid': '#38:1',
            createdAt: 1565629077198,
            createdBy: '#29:0',
            description: 'civic is an open access, open source, community-driven web resource for clinical interpretation of variants in cancer',
            displayName: 'CIViC',
            name: 'civic',
            sort: 99999,
            updatedAt: 1565629077198,
            updatedBy: '#29:0',
            url: 'https://civicdb.org',
            usage: 'https://creativecommons.org/publicdomain/zero/1.0',
            uuid: '26a9c986-cede-4595-9c53-c62e707ea205',
        };
        const newContent = { ...originalContent };
        newContent.description = 'a new description';
        newContent.reviewStatus = 'pending';
        const excludedFieldsExhaustive = ['description', 'reviewStatus'];
        const excludedFieldsNonExhaustive = ['description'];

        expect(shouldUpdate(
            model,
            originalContent,
            newContent,
            excludedFieldsNonExhaustive,
        )).toBe(true);

        expect(shouldUpdate(
            model,
            originalContent,
            newContent,
            excludedFieldsExhaustive,
        )).toBe(false);

        newContent.source.name = 'a new source name';
        expect(shouldUpdate(
            model,
            originalContent,
            newContent,
            excludedFieldsExhaustive,
        )).toBe(false);
    });
});

describe('simplifyRecordsLinks', () => {
    test.each([
        123,
        123.0,
        'abc',
        null,
        undefined,
        false,
        {},
        { a: 1, b: 1 },
        { '@rid': 123, a: 1 },
    ])('does not change', (inputValue) => {
        const output = simplifyRecordsLinks(inputValue);
        expect(output).toEqual(inputValue);
    });

    test.each([
        [
            { a: [{ '@rid': 123, aa: 1 }, { ab: 2 }] },
            { a: ['123', { ab: 2 }] },
        ],
        [
            { a: { '@rid': 123, aa: 1 }, b: 2 },
            { a: '123', b: 2 },
        ],
        [
            { a: { '@rid': 123, a: { '@rid': 123, aa: 1 } } },
            { a: '123' },
        ],
    ])('being unnested', (inputValue, expectedValue) => {
        const output = simplifyRecordsLinks(inputValue);
        expect(output).toEqual(expectedValue);
    });
});
