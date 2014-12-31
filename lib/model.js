
"use strict";

/**
 *
 */
function Model(data, imageLoad) {
  this.chanceRange = {
    from: data['chance_range'].values[0],
    to: data['chance_range'].values[1]
  };

  this.activeTime = {
    min: data['active_time'].values[0],
    max: data['active_time'].values[1]
  };

  this.srcLtwh = data['src_ltwh'].values;
  this.image = imageLoad(this.srcLtwh);
}

module.exports = Model;
