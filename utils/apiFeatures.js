class APIFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  filtering() {
    // 1A) Filtering
    const queryObj = { ...this.queryStr };
    const excudedFields = ['sort', 'limit', 'page', 'select'];
    excudedFields.forEach((el) => delete queryObj[el]);

    //1B) Advanced Filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gl|gte|lt|lte)\b/g, (match) => `$${match}`);

    this.query.find(JSON.parse(queryStr));
    return this;
  }
  sorting() {
    if (this.queryStr.sort) {
      //sort('price ratingsAverage')
      const sortBy = this.queryStr.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-ratingsAverage');
    }

    return this;
  }
  selection() {
    if (this.queryStr.select) {
      const selectFields = this.queryStr.select.split(',').join(' ');
      //console.log(req.query.fields);
      this.query = this.query.select(selectFields);
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }
  pagination() {
    const page = this.queryStr.page * 1 || 1;
    const limit = this.queryStr.limit * 1 || 20;
    const skip = limit * (page - 1);

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
