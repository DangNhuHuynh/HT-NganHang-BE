var db = require('../models');
class My_model {
    static async model_fields(model) {
        try {
            var mySchema = 'db.' + model;
            return Object.keys(eval(mySchema).schema.paths);
        } catch (e) {
            console.log(e);
            return {};
        }
    }

    static create_not_async(req, model, data) {
        try {
            var mySchema = eval('db.' + model);

            // Do async job
            if (req.session.userdata) {
                data.created = req.session.userdata.username;
                data.modified = req.session.userdata.username;
            }
            else if(req.user) {
                data.created = req.user.username;
                data.modified = req.user.username;
            }
            else {
                data.created = 'n/a';
                data.modified = 'n/a';
            }


            let tmp = eval(new mySchema(data));
            tmp.save();
            return { status: 200, data: data };
        }
        catch (e) {
            console.log(e);
            return { status: e.code, data: e.message };
        }
    }

    static async create(req, model, data) {
        try {
            var mySchema = eval('db.' + model);

            // Do async job
            if (req.session.userdata) {
                data.created = req.session.userdata.username;
                data.modified = req.session.userdata.username;
            }
            else if(req.user) {
                data.created = req.user.username;
                data.modified = req.user.username;
            }
            else {
                console.log(data)
                data.created = 'n/a';
                data.modified = 'n/a';
            }
            console.log(data);

            let tmp = eval(new mySchema(data));
            let new_item = await tmp.save();
            return { status: 200, data: new_item };
        }
        catch (e) {
            console.log(e);
            return { status: e.code, data: e.message };
        }
    }

    static async update_multi(req, model, where, data, multi = false) {
        try {
            var mySchema = 'db.' + model;

            // Do async job
            if (req.session.userdata) {
                data.modified = req.session.userdata.username;
            }
            else if(req.user) {
                data.modified = req.user.username;
            }
            else{
                data.modified = 'n/a';
            }

            let update = await eval(mySchema).update(where, data, { multi: multi });

            if (!update) {
                return { status: 500, data: update };
            } else {
                return { status: 200, data: update };
            }
        } catch (e) {
            console.log(e);
            return { status: e.code, data: e.message };
        }
    }



    static async update(req, model, where, data, create_new = false) {
        try {
            var mySchema = 'db.' + model;

            // Do async job
            if (req.session.userdata) {
                data.modified = req.session.userdata.username;
            }
            else{
                data.modified = 'n/a';
            }

            let update = await eval(mySchema).findOneAndUpdate(where, data, { new: create_new });

            if (!update) {
                return { status: 500, data: update };
            } else {
                return { status: 200, data: update };
            }
        } catch (e) {
            console.log(e);
            return { status: e.code, data: e.message };
        }
    }

    static async delete(model, where) {
        try {
            var mySchema = 'db.' + model;

            let del = await eval(mySchema).findOneAndRemove(where);

            if (!del) {
                return { status: 500, data: del };
            } else {
                return { status: 200, data: del };
            }
        } catch (e) {
            console.log(e);
            return { status: e.code, data: e.message };
        }
    }

    static async deleteMany(model, where) {
        try {
            var mySchema = 'db.' + model;

            let del = await eval(mySchema).deleteMany(where);

            if (!del) {
                return { status: 500, data: del };
            } else {
                return { status: 200, data: del };
            }
        } catch (e) {
            console.log(e);
            return { status: e.code, data: e.message };
        }
    }

    static async findById(model, id, str_fields = '') {
        try {
            var mySchema = 'db.' + model;

            let item = null;
            if (str_fields == '') {
                item = await eval(mySchema).findById(id);
            }
            else {
                item = await eval(mySchema).findById(id, str_fields);
            }

            return item;

        } catch (e) {
            console.log(e);
            return null;
        }
    }

    static async find_all(model, where, str_fields = '', order = { createdAt: 'asc' }) {
        try {
            var mySchema = 'db.' + model;

            let items;
            if (str_fields == '') {
                items = await eval(mySchema).find(where).sort(order);
            }
            else {
                items = await eval(mySchema).find(where, str_fields).sort(order);
            }

            return items;

        } catch (err) {
            console.log(err);
            return {};
        }
    }

    static async find(model, where, str_fields = '', limit = 1, order = { createdAt: 'asc' }) {
        try {
            var mySchema = 'db.' + model;

            let items;
            if (str_fields == '') {
                items = await eval(mySchema).find(where).sort(order).limit(limit);
            }
            else {
                items = await eval(mySchema).find(where, str_fields).sort(order).limit(limit);
            }

            return items;

        } catch (e) {
            console.log(e);
            return {};
        }
    }

    //object
    static async find_first(model, where, str_fields = '', order = { createdAt: 'asc' }) {
        try {
            var mySchema = 'db.' + model;

            let items;
            if (str_fields == '') {
                items = await eval(mySchema).find(where).sort(order).limit(1);
            }
            else {
                items = await eval(mySchema).find(where, str_fields).sort(order).limit(1);
            }

            if (items.length > 0) {
                return items[0];
            }
            else {
                return null;
            }

        } catch (e) {
            console.log(e.message);
            return null;
        }
    }

    static async paging(model, where, str_fields, page, page_size, order = { createdAt: 'desc' }) {
        try {
            var mySchema = 'db.' + model;

            if (page == undefined)
                page = 1;
            var skip = (page - 1) * page_size;

            let items;
            if (str_fields == '') {
                items = await eval(mySchema).find(where).lean(true).sort(order).skip(skip).limit(page_size);
            }
            else {
                items = await eval(mySchema).find(where, str_fields).lean(true).sort(order).skip(skip).limit(page_size);
            }

            return items;

        } catch (err) {
            console.log(err);
            return {};
        }
    }

    static async total_item(model, where) {
        try {
            var mySchema = 'db.' + model;

            let items;
            items = await eval(mySchema).countDocuments(where);

            return parseInt(items);

        } catch (err) {
            console.log(err);
            return 0;
        }
    }

    static async standard_datetime(d) {
        return moment(d).utcOffset('+0700').format("YYYY-MM-DDTHH:mm:ss.SSSZ"); //req.params.startTime = 2016-09-25 00:00:00
    }

    static async aggregate_count_group_by(model, where, group_by) {
        try {
            var filter = helpers.helper.aggregate_data_filter_where(where);
            var mySchema = 'db.' + model;
            let items;
            items = await eval(mySchema).aggregate(
                [
                    {
                        "$match": filter
                    },
                    {
                        "$group": {
                            "_id": '$' + group_by,
                            "count": { "$sum": 1 }
                        }
                    }
                ]
            );

            return items;
        }
        catch (err) {
            console.log(err);
            return [];
        }
    }

    static async aggregate_sum_group_by(model, where, group_by, sum_by) {
        try {
            var filter = helpers.helper.aggregate_data_filter_where(where);
            console.log(filter);
            var mySchema = 'db.' + model;
            let items;
            items = await eval(mySchema).aggregate(
                [
                    {
                        "$match": filter
                    },
                    {
                        "$group": {
                            "_id": '$' + group_by,
                            "count": { "$sum": '$' + sum_by }
                        }
                    }
                ]
            );
            return items;
        }
        catch (err) {
            console.log(err);
            return [];
        }
    }

    static async aggregate_find_group_by(model, where, group_by, order = { createdAt: 'asc' }) {
        try {
            var mySchema = 'db.' + model;
            let items;
            items = await eval(mySchema).aggregate(
                [
                    {
                        "$match": where
                    },
                    {
                        "$group": {
                            "_id": '$' + group_by
                        }
                    },
                    {
                        "$sort" : {'_id' : 1}
                    }
                ]
            );

            return items;

        } catch (err) {
            console.log(err);
            return {};
        }
    }

}

module.exports = My_model;