import UserModel from './models';
import { userType } from './types/types';
import * as readline from 'readline';

let user_name = '';
let password = '';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question1 = () => {
  return new Promise((resolve: any) => {
    rl.question('plz enter user name ', (answer: string) => {
      user_name = answer;
      resolve();
    });
  });
};

const question2 = () => {
  return new Promise((resolve: any) => {
    rl.question('plz enter password ', (answer: string) => {
      password = answer;
      resolve();
    });
  });
};

const main = async () => {
  await question1();
  await question2();

  if (!user_name || !password) {
    console.error('empty user name or password');
    process.exit(1);
  } else {
    const start = async () => {
      try {
        const user = new UserModel();
        const user_obj: userType = await user.createRecord({ user_name, password, superuser: true });
        console.log(user_obj);
        process.exit(1);
      } catch (error) {
        console.error((error as Error).message);
        process.exit(1);
      }
    };
    start();
  }

  rl.close();
};

main();
