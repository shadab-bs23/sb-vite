import { ref } from "vue";

export const useToggle = () => {
  const show = ref<boolean>(false);

  const toggleShow = () => {
    show.value = !show.value;
  };
  const toggleShowByValue = (value: boolean) => {
    show.value = value;
  };

  return {
    show,
    toggleShow,
    toggleShowByValue,
  };
};
