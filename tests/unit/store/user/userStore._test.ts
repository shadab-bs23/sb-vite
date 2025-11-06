// import { initAmplify } from "@/services/auth/auth.service";
// import useUserStore from "@/store/user/user.store";
// import { setActivePinia, createPinia } from "pinia";
// import { GeneralError } from "types/errors/errors.type";
// import {
//   mockSignInPayload,
//   mockSignInResponse,
//   mockAccAlreadyExistExp,
// } from "../../../../tests/testData/user/userProfile";
// import { signUpData } from "../../../testData/user/userProfile";

// describe("User Store", () => {
// initAmplify();
// beforeEach(() => {
//   // creates a fresh pinia and make it active so it's automatically picked
//   // up by any useStore() call without having to pass it to it:
//   // `useStore(pinia)`
//   setActivePinia(createPinia());
// });
// it("[Action] signInAction", () => {
//   const user = useUserStore();
//   user.signInAction(mockSignInPayload).then((res) => {
//     expect(res).toEqual(mockSignInResponse);
//   });
// });

// it("[Action] handleSignUp", async () => {
//   const user = useUserStore();
//   expect(signUpData).toEqual(signUpData);
//   await user
//     .handleSignUp(signUpData)
//     .then(() => {
//       expect(signUpData).toEqual(signUpData);
//     })
//     .catch((e: GeneralError) => {
//       expect(e.message).toEqual(mockAccAlreadyExistExp);
//     });
// });
// });
