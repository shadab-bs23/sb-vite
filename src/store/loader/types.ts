import { StoreDefinition } from "pinia";

export interface State {
  isLoading: boolean;
  loaderIcon?: string;
  color?: string;
  full_page?: boolean;
}

interface Getters {
  getLoadingStatus: () => State;
}
interface Actions {
  changeLoadingStatus: (payload: State) => void;
}
/*
 * store context define as summarize of store
 */
export type StoreContext = ReturnType<
  StoreDefinition<"loader", State, Getters, Actions>
>;
