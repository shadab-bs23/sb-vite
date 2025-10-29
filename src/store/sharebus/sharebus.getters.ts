import {
  SharebusStepOne,
  SharebusStepThree,
  SharebusStepTwo,
  State,
} from "./types";

export default {
  /*
   * getting the loader
   */
  getStepOneData(state: State): SharebusStepOne {
    return state.setup.stepOne;
  },

  /*
   * getting the loader
   */
  getStepTwoData(state: State): SharebusStepTwo {
    return state.setup.stepTwo;
  },

  /*
   * getting the loader
   */
  getStepThreeData(state: State): SharebusStepThree {
    return state.setup.stepThree;
  },
};
