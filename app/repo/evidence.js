'use strict';
const {Base, KBVertex} = require('./base');
const {AttributeError} = require('./error');
const currYear = require('year');

/**
*
* @todo more properties to be added to journal class
*
*/

/**
 * @class
 * @extends KBVertex
 */
class Evidence extends KBVertex {

    static createClass(db){
        return new Promise((resolve, reject) => {
            Base.createClass({db, clsname: this.clsname, superClasses: KBVertex.clsname, isAbstract: true})
                .then(() => {
                    return this.loadClass(db);
                }).then((cls) => {
                    resolve(cls);
                }).catch((error) => {
                    reject(error);
                });
        });
    }
}

/**
 * @class
 * @extends KBVertex
 */
class Publication extends KBVertex {

    validateContent(content, journalClass) {
        if ([content.title, content.journal, content.year].some(x => x == undefined)) {
            throw new AttributeError('violated null constraint');
        } else if ((content.year < 1000) || (content.year > currYear('yyyy'))) {
            throw new AttributeError('publication year cannot be too old or in the future');
        }

        content.journal = journalClass.validateContent(content.journal);
        content.title = content.title.toLowerCase();
        if (content.doi != undefined || content.pmid != undefined) {
            if (! content.doid === parseInt(content.doid, 10)) {
                // if pmid is not an integer
                throw new AttributeError('PMID must be an integer');
            } else {
                content.doi = content.doi.toLowerCase();
            }
        }

        return super.validateContent(content);
    }

    createRecord(opt, journalClass) {
        return new Promise((resolve, reject) => {
            const args = this.validateContent(opt, journalClass);
            var commit = this.dbClass.db
                .let('journalName', (trs) => {
                    return trs.create(journalClass.constructor.createType, journalClass.constructor.clsname).set(args.journal);
                }).let('link', (trs) => {
                    //connect the nodes
                    const sub = Object.assign({}, args);
                    delete sub.journal;
                    return trs.create(this.constructor.createType, this.constructor.clsname).set(sub).set('journal = $journalName');
                }).commit();
            commit.return('$link').one().then((record) => {
                this.dbClass.db.record.get(record.journal).then((journalName) => {
                    record.journal = journalName;
                    resolve(record);
                }).catch((error) => {
                    reject(error);
                });
            }).catch((error) => {
                reject(error);
            });
        });
    }

    static createClass(db){
        return new Promise((resolve, reject) => {
            const props = [
                {name: 'journal', type: 'link', mandatory: true, notNull: true, linkedClass: Evidence.clsname},
                {name: 'year', type: 'integer', mandatory: true, notNull: true},
                {name: 'title', type: 'string', mandatory: true, notNull: true},
                {name: 'doi', type: 'string', mandatory: false},
                {name: 'pmid', type: 'integer', mandatory: false},
            ];
            const idxs = [{
                name: this.clsname + '.index_jyt',
                type: 'unique',
                metadata: {ignoreNullValues: false},
                properties: ['deleted_at', 'journal', 'year', 'title'],
                'class':  this.clsname
            }];
            Base.createClass({db, clsname: this.clsname, superClasses: Evidence.clsname, properties: props, isAbstract: false, indices: idxs})
                .then(() => {
                    return this.loadClass(db);
                }).then((cls) => {
                    resolve(cls);
                }).catch((error) => {
                    reject(error);
                });
        });
    }
}


/**
 * @class
 * @extends KBVertex
 */
class Journal extends KBVertex {

    validateContent(content) {
        if (content.name == undefined) {
            throw new AttributeError('violated null constraint');
        }
        content.name = content.name.toLowerCase();
        return super.validateContent(content);
    }

    static createClass(db) {
        return new Promise((resolve, reject) => {
            const props = [
                {name: 'name', type: 'string', mandatory: true, notNull: true},
            ];
            const idxs = [{
                name: this.clsname + '.index_name',
                type: 'unique',
                metadata: {ignoreNullValues: false},
                properties: ['deleted_at', 'name'],
                'class':  this.clsname
            }];
            Base.createClass({db, clsname: this.clsname, superClasses: Evidence.clsname, properties: props, isAbstract: false, indices: idxs})
                .then(() => {
                    return this.loadClass(db);
                }).then((cls) => {
                    resolve(cls);
                }).catch((error) => {
                    reject(error);
                });
        });
    }
}


/**
 * @class
 * @extends KBVertex
 */
class Study extends KBVertex {

    validateContent(content) {
        if (content.title == undefined || content.year == undefined) {
            throw new AttributeError('violated null constraint');
        } else if ((content.year < 1000) || (content.year > currYear('yyyy'))) {
            throw new AttributeError('study year cannot be in the future');
        }

        // TODO: Validate year
        content.title = content.title.toLowerCase();
        return super.validateContent(content);
    }

    static createClass(db) {
        return new Promise((resolve, reject) => {
            const props = [
                {name: 'title', type: 'string', mandatory: true, notNull: true},
                {name: 'year', type: 'integer', mandatory: true, notNull: true},
                {name: 'sample_population', type: 'string'},
                {name: 'sample_population_size', type: 'integer'},
                {name: 'method', type: 'string'},
                {name: 'url', type: 'string'}
            ];
            const idxs = [{
                name: this.clsname + '.index_ty',
                type: 'unique',
                metadata: {ignoreNullValues: false},
                properties: ['deleted_at', 'title', 'year'],
                'class':  this.clsname
            }];
            Base.createClass({db, clsname: this.clsname, superClasses: Evidence.clsname, properties: props, isAbstract: false, indices: idxs})
                .then(() => {
                    return this.loadClass(db);
                }).then((cls) => {
                    resolve(cls);
                }).catch((error) => {
                    reject(error);
                });
        });
    }
}


/**
 * @class
 * @extends KBVertex
 */
class ClinicalTrial extends KBVertex {

    validateContent(content) {
        return super.validateContent(content);
    }

    static createClass(db) {
        return new Promise((resolve, reject) => {
            const props = [

                {name: 'phase', type: 'integer'},
                {name: 'trial_id', type: 'string'},
                {name: 'official_title', type: 'string'},
                {name: 'summary', type: 'string'}
            ];
            const idxs = [{
                name: this.clsname + '.index_trial_id',
                type: 'unique',
                metadata: {ignoreNullValues: false},
                properties: ['deleted_at','trial_id'],
                'class':  this.clsname
            },
            {
                name: this.clsname + '.index_official_title',
                type: 'unique',
                metadata: {ignoreNullValues: false},
                properties: ['deleted_at','official_title'],
                'class':  this.clsname
            }];
            Base.createClass({db, clsname: this.clsname, superClasses: Study.clsname, properties: props, isAbstract: false, indices: idxs})
                .then(() => {
                    return this.loadClass(db);
                }).then((cls) => {
                    resolve(cls);
                }).catch((error) => {
                    reject(error);
                });
        });
    }
}


/**
 * @class
 * @extends KBVertex
 */
class ExternalSource extends KBVertex {

    validateContent(content) {
        if (content.url == undefined || content.extraction_date == undefined) {
            throw new AttributeError('violated null constraint');
        }
        return super.validateContent(content);
    }

    static createClass(db) {
        return new Promise((resolve, reject) => {
            const props = [
                {name: 'title', type: 'string'},
                {name: 'url', type: 'string', mandatory: true, notNull: true},
                {name: 'extraction_date', type: 'string', mandatory: true, notNull: true}
            ];
            const idxs = [{
                name: this.clsname + '.index_url_date',
                type: 'unique',
                metadata: {ignoreNullValues: false},
                properties: ['deleted_at', 'url', 'extraction_date'],
                'class':  this.clsname
            }];
            Base.createClass({db, clsname: this.clsname, superClasses: Evidence.clsname, properties: props, isAbstract: false, indices: idxs})
                .then(() => {
                    return this.loadClass(db);
                }).then((cls) => {
                    resolve(cls);
                }).catch((error) => {
                    reject(error);
                });
        });
    }
}

module.exports = {Evidence, Publication, Journal, Study, ClinicalTrial, ExternalSource};