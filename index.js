// modulos externos
import chalk from 'chalk';
import inquirer from 'inquirer';

// modulos internos
import fs from 'fs';

console.log('Iniciamos o accounts');

function operation() {
  inquirer.prompt([
    {
      type: 'list',
      name: 'option',
      message: 'O que você deseja fazer?',
      choices: [
        'Criar Conta',
        'Consultar Saldo',
        'Depositar',
        'Sacar',
        'Sair'
      ]
    }
  ]).then((answers) => {
    // console.log(answers);
    switch (answers.option) {
      case 'Sair':
        console.log('Obrigado por usar nosso sistema');
        process.exit();
        break;
      case 'Criar Conta':
        createAccount();
        break;
      case 'Consultar Saldo':
        console.log('Consultar Saldo');
        getAccountBalance();
        break;
      case 'Depositar':
        deposit();
        break;
      case 'Sacar':
        withdraw();
        break;
      default:
        console.log('Opção inválida');
        operation();
        break;
    }
  });
}

operation();

// create an account
function createAccount() {
  console.log(chalk.bgGreen.black('Parabéns por escolher o nosso banco!'));
  console.log(chalk.green('Vamos criar sua conta!'));
  console.log(chalk.green('Para isso, precisamos de algumas informações:'));
  buildAccount();
}

//add an amount to user account
function deposit() {
  inquirer.prompt([
    {
      type: 'input',
      name: 'accountName',
      message: 'Qual o nome da conta?'
    },
    {
      type: 'input',
      name: 'amount',
      message: 'Qual o valor do depósito?'
    }
  ]).then((answers) => {
    if (!accountExists(answers.accountName)) {
      console.log(chalk.bgRed.black('Conta não encontrada!'));
      return deposit();
    }
    addAmount(answers.accountName, answers.amount);

  });
}

function addAmount(accountName, amount) {
  const account = getAccount(accountName);

  // Error handlers
  if (!amount) {
    console.log(chalk.bgRed.black('Valor inválido'));
    return deposit();
  }

  if (!account) {
    console.log(chalk.bgRed.black('Conta não encontrada!'));
    return deposit();
  }

  const accountPath = `accounts/${accountName}.json`;
  account.balance += parseFloat(amount);

  fs.writeFileSync(accountPath, JSON.stringify(account), (err) => {
    if (err) {
      console.log(chalk.bgRed.black('Não foi possível realizar o depósito'));
      console.log(err);
    }
  });

  console.log(chalk.green('Depósito realizado com sucesso!'));
  operation();

}

function subtractAmount(accountName, amount) {
  const accountPath = `accounts/${accountName}.json`;

  if(!accountExists(accountName)) {
    console.log(chalk.bgRed.black('Conta não encontrada!'));
    return withdraw();
  }

  const account = getAccount(accountName);

  if(!amount || amount < 0 || isNaN(amount)) {
    console.log(chalk.bgRed.black('Valor inválido'));
    return withdraw();
  }

  if(amount > account.balance) {
    console.log(chalk.bgRed.black('Saldo insuficiente'));
    return withdraw();
  }

  account.balance -= parseFloat(amount);

  fs.writeFileSync(accountPath, JSON.stringify(account), (err) => {
    if (err) {
      console.log(chalk.bgRed.black('Não foi possível realizar o depósito'));
      console.log(err);
    }
  });

  console.log(chalk.bgGreen.black('Saque realizado com sucesso!'));
  console.log(chalk.bgGreen.black(`O novo saldo da conta ${account.name} é R$ ${account.balance}`));
  operation();
}


function buildAccount() {
  inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Qual o nome do titular da conta?'
    },
    {
      type: 'input',
      name: 'accountName',
      message: 'Dê um nome personalizado para sua conta:'
    }
  ]).then((answers) => {
    // console.log(answers);
    const account = {
      name: answers.name,
      accountName: answers.accountName,
      balance: 0
    };
    // console.log(account);
    if (!fs.existsSync('accounts')) {
      fs.mkdirSync('accounts');
    }

    const accountPath = `accounts/${answers.accountName}.json`;

    if (fs.existsSync(accountPath)) {
      console.log(chalk.red('Já existe uma conta com esse nome!'));
      console.log(chalk.red('Por favor, escolha outro nome para sua conta'));
      buildAccount();
      return;
    } else {
      fs.writeFileSync(accountPath, JSON.stringify(account), (err) => {
        if (err) {
          console.log(chalk.red('Não foi possível criar a conta'));
          console.log(err);
        }
      });
    }

    console.log('Conta criada com sucesso!');
    operation();
  });
}


// helper

function accountExists(accountName) {
  const accountPath = `accounts/${accountName}.json`;
  return fs.existsSync(accountPath);
}

function getAccount(accountName) {
  const accountPath = `accounts/${accountName}.json`;
  return JSON.parse(fs.readFileSync(accountPath, 'utf-8'));
};

// Show account balance
function getAccountBalance() {
  inquirer.prompt([
    {
      type: 'input',
      name: 'accountName',
      message: 'Qual o nome da conta?'
    }
  ]).then((answers) => {

    const accountName = answers.accountName;
    if(!accountExists(accountName)) {
      console.log(chalk.red('Conta não encontrada!'));
      return getAccountBalance();
    }

    const account = getAccount(answers.accountName);
    console.log(chalk.green(`O saldo da conta ${account.name} é R$ ${account.balance}`));
    operation();
  }).catch((err) => {
    console.log(chalk.red('Não foi possível consultar o saldo'));
    console.log(err);
  });
}

// withdraw an amount from user account
function withdraw() {
  inquirer.prompt([
    {
      type: 'input',
      name: 'accountName',
      message: 'Qual o nome da conta?'
    },
    {
      type: 'input',
      name: 'amount',
      message: 'Qual o valor do saque?'
    }
  ]).then((answers) => {
    if (!accountExists(answers.accountName)) {
      console.log(chalk.bgRed.black('Conta não encontrada!'));
      return withdraw();
    }
    subtractAmount(answers.accountName, answers.amount);

  });
}