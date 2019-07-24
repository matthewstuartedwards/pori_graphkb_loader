/**
 * @module importer/entrez/refseq
 */
const Ajv = require('ajv');

const {fetchByIdList, uploadRecord} = require('./util');
const {checkSpec} = require('../util');

const ajv = new Ajv();

const SOURCE_DEFN = {
    displayName: 'RefSeq',
    longName: 'RefSeq: NCBI Reference Sequence Database',
    name: 'refseq',
    url: 'https://www.ncbi.nlm.nih.gov/refseq',
    usage: 'https://www.ncbi.nlm.nih.gov/home/about/policies',
    description: `
        A comprehensive, integrated, non-redundant, well-annotated set of reference sequences
        including genomic, transcript, and protein.`.replace(/\s+/, ' ')
};
const DB_NAME = 'nucleotide';
const CACHE = {};

const recordSpec = ajv.compile({
    type: 'object',
    required: ['title', 'biomol', 'accessionversion'],
    properties: {
        accessionversion: {type: 'string', pattern: '^N[A-Z]_\d+\.\d+$'},
        biomol: {type: 'string', enum: ['genomic', 'rna', 'peptide']},
        subname: {type: 'string'},
        title: {type: 'string'}
    }
});

/**
 * Given an record record retrieved from pubmed, parse it into its equivalent
 * GraphKB representation
 */
const parseRecord = (record) => {
    checkSpec(recordSpec, record);
    const [sourceId, sourceIdVersion] = record.accessionversion.split('.');

    let biotype = 'chromosome';
    if (record.biomol === 'rna') {
        biotype = 'transcript';
    } else if (record.biomol === 'peptide') {
        biotype = 'protein';
    }
    const parsed = {
        sourceId,
        sourceIdVersion,
        biotype,
        longName: record.title
    };
    if (biotype === 'chromosome') {
        parsed.name = record.subname;
    }
    return parsed;
};


/**
 * Given some list of pubmed IDs, return if cached,
 * If they do not exist, grab from the pubmed api
 * and then upload to GraphKB
 *
 * @param {ApiConnection} api connection to GraphKB
 * @param {Array.<string>} idList list of pubmed IDs
 */
const fetchAndLoadByIds = async (api, idListIn) => {
    const records = await fetchByIdList(
        idListIn,
        {
            db: DB_NAME, parser: parseRecord, cache: CACHE
        }
    );
    return Promise.all(records.map(
        async record => uploadRecord(api, record, {
            cache: CACHE,
            endpoint: 'features',
            sourceDefn: SOURCE_DEFN
        })
    ));
};


module.exports = {
    parseRecord,
    fetchAndLoadByIds,
    SOURCE_DEFN
};
