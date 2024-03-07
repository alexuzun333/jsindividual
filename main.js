class TransactionAnalyzer {
  constructor(fileUrl) {
    //this как будто бы нам говорит что ЭТА ссылка на файл из конструктора равна параметру который мы передаем
    this.fileUrl = fileUrl;
  }
  // Делаем фейковый фетч метод чтобы получить данные из жсон файла
  fetchTransactions() {
    return (
      fetch(this.fileUrl)
        .then((res) => {
          //По идее тут можно было бы даже не обрабатывать ошибки, но пусть будет
          if (!res.ok) {
            throw new Error("Something is not ok with network");
          }
          //Если все хорошо возвращаем жсон ответ
          return res.json();
        })
        // Пробрасываем ошибку если чето не так но опять же тут можно было этого не делать
        .catch((error) => {
          console.error("There was a problem with the fetch operation:", error);
          throw error;
        })
    );
  }
  // Получаем все транзакции
  getAllTransactions() {
    console.log("Here are all transactions:");
    return this.fetchTransactions() // Возвращаем промис, который возвращает все транзакции
      .then((transactions) => {
        console.log(transactions); // Выводим все транзакции в консоль
      });
  }
  // Добавляем транзакцию
  addNewTransaction(transaction) {
    return this.fetchTransactions().then((transactions) => {
      transactions.push(transaction);
      console.log(
        `New entry added in transactions: ${JSON.stringify(transaction)}`
      );
      return transactions;
    });
  }
  // Здесь мы возвращаем какие у нас могут быть уникальные типы транзакций
  getUniqueTransactionType() {
    const uniqueTypeSet = new Set();
    return this.fetchTransactions().then((transactions) => {
      transactions.forEach((transaction) => {
        if (!uniqueTypeSet.has(transaction.transaction_type)) {
          uniqueTypeSet.add(transaction.transaction_type);
        }
      });
      console.log(Array.from(uniqueTypeSet));
    });
  }
  calculateTotalAmount() {
    let sum = 0;
    return this.fetchTransactions().then((transactions) => {
      transactions.forEach((transaction) => {
        sum += transaction.transaction_amount;
      });
      console.log(`Сумма всех транзакицй: ${sum}`);
    });
  }
  calculateTotalAmountByDate(year, month, day) {
    let sumByDate = 0;
    return this.fetchTransactions().then((transaction) => {
      transaction.forEach((transaction) => {
        const transactionDate = new Date(transaction.transaction_date);
        if (
          (!year || transactionDate.getFullYear() === year) &&
          (!month || transactionDate.getMonth() + 1 === month) &&
          (!day || transactionDate.getDay() === day)
        ) {
          sumByDate += transaction.transaction_amount;
        }
      });
      console.log(`Сумма за год месяц или день которые вы ввели: ${sumByDate}`);
    });
  }
  getTransactionByType(type) {
    return this.fetchTransactions().then((transactions) => {
      // Массив, куда мы будем пушить транзакции определенного типа
      const arr = [];
      transactions.forEach((transaction) => {
        if (transaction.transaction_type === type) {
          arr.push(transaction);
        }
      });
      console.log(arr, `Транзакции вашего типа: ${type}`);
    });
  }
  getTransactionsInDateRange(startDate, endDate) {
    // Массив, куда мы будем пушить транзакции в диапазоне
    const arr = [];
    return this.fetchTransactions().then((transactions) => {
      transactions.forEach((transaction) => {
        const transactionDate = new Date(transaction.transaction_date);

        // Проверяем, находится ли дата транзакции в диапазоне между startDate и endDate
        if (
          transactionDate >= new Date(startDate) &&
          transactionDate <= new Date(endDate)
        ) {
          arr.push(transaction);
        }
      });
      console.log(
        arr,
        `Транзакции в диапазоне между ${startDate} и ${endDate}`
      );
      return arr;
    });
  }
  getTransactionsByMerchant(merchantName) {
    return this.fetchTransactions().then((transactions) => {
      //Массив куда мы будем пушить транзакции с совпадающим именем
      const arr = [];
      transactions.forEach((transaction) => {
        if (transaction.merchant_name === merchantName) {
          arr.push(transaction);
        }
      });
      console.log(arr, `Транзакции с именем: ${merchantName}`);
      return arr;
    });
  }
  calculateAverageTransactionAmount() {
    let sum = 0;
    return this.fetchTransactions().then((transactions) => {
      //Можно еще использовать transaction.length т.к это массив вместо двух строк ниже
      const lastTransaction = [...transactions].pop(); // Получаем последнюю транзакцию из копии массива
      const lastTransactionId = lastTransaction.transaction_id; // Извлекаем ID последней транзакции
      transactions.forEach((transaction) => {
        sum += transaction.transaction_amount;
      });
      //То есть тут можно просто делить на длину массива транзакий const avg = sum / transactions.length;
      const avg = sum / lastTransactionId;
      console.log(`Среднее значение транзакций: ${avg}`);
      return avg;
    });
  }
  getTransactionsByAmountRange(minAmount, maxAmount) {
    //Массив куда мы будем пушить транзакции которые будут удовлетворять условию
    const arr = [];
    return this.fetchTransactions().then((transactions) => {
      transactions.forEach((transaction) => {
        if (
          transaction.transaction_amount >= minAmount &&
          transaction.transaction_amount <= maxAmount
        ) {
          arr.push(transaction);
        }
      });
      console.log(arr, "Все ваши транзакции в указанном диапазоне");
      return arr;
    });
  }
  calculateTotalDebitAmount() {
    let debitSum = 0;
    return this.fetchTransactions().then((transactions) => {
      transactions.forEach((transaction) => {
        if (transaction.transaction_type === "debit") {
          debitSum += transaction.transaction_amount;
        }
      });
      console.log(`Сумма всех транзакций с дебетовым типом: ${debitSum}`);
    });
  }
  findMostTransactionsMonth() {
    // Объект, в котором будем хранить количество транзакций для каждого месяца(пытался использовать массив но даже чат
    // гпт подсказал что лучше всего подойдет объект с парами ключ значение
    const transactionsByMonth = {};
    return this.fetchTransactions().then((transactions) => {
      transactions.forEach((transaction) => {
        const transactionDate = new Date(transaction.transaction_date);
        const transactionMonth = transactionDate.getMonth() + 1;
        // Проверяем, есть ли уже такой месяц в объекте transactionsByMonth
        if (transactionsByMonth[transactionMonth]) {
          // Если месяц уже есть, увеличиваем количество транзакций для этого месяца на 1
          transactionsByMonth[transactionMonth]++;
        } else {
          // Если месяца еще нет, создаем его и устанавливаем количество транзакций в 1
          transactionsByMonth[transactionMonth] = 1;
        }
      });
      // Находим месяц с наибольшим количеством транзакций
      let mostTransactionsMonth;
      let maxTransactions = 0;
      // Логика такая если транзакции за месяц превышают мак кол-во транзакций прошлого месяца то этот месяц становится
      // Месяц в котором уже больше всего транзакций
      for (let month in transactionsByMonth) {
        if (transactionsByMonth[month] > maxTransactions) {
          maxTransactions = transactionsByMonth[month];
          mostTransactionsMonth = month;
        }
      }
      // Возвращаем найденный месяц с наибольшим количеством транзакций
      console.log(
        `Месяц с наибольшим количеством транзакций: ${mostTransactionsMonth}`
      );
      return mostTransactionsMonth;
    });
  }
  findMostDebitTransactionMonth() {
    // Объект, в котором будем хранить количество дебетовых транзакций для каждого месяца
    const mostDebitTransactionsByMonth = {};

    return this.fetchTransactions().then((transactions) => {
      transactions.forEach((transaction) => {
        const transactionDate = new Date(transaction.transaction_date);
        const transactionMonth = transactionDate.getMonth() + 1;

        // Проверяем, является ли транзакция дебетовой и увеличиваем счетчик для текущего месяца
        //  Когда мы проходимся по всем транзакциями первого месяца и получаем второй код знает что такого месяца еще не было и ставит ему значение 0
        if (transaction.transaction_type === "debit") {
          mostDebitTransactionsByMonth[transactionMonth] =
            (mostDebitTransactionsByMonth[transactionMonth] || 0) + 1;
        }
      });

      // Находим месяц с наибольшим количеством дебетовых транзакций
      let mostDebitTransactionsMonth;
      let maxDebitTransactions = 0;

      for (let month in mostDebitTransactionsByMonth) {
        if (mostDebitTransactionsByMonth[month] > maxDebitTransactions) {
          maxDebitTransactions = mostDebitTransactionsByMonth[month];
          mostDebitTransactionsMonth = month;
        }
      }
      // Возвращаем найденный месяц с наибольшим количеством дебетовых транзакций
      console.log(
        `Месяц с наибольшим количеством дебетовых транзакций: ${mostDebitTransactionsMonth}`
      );
      return mostDebitTransactionsMonth;
    });
  }
  mostTransactionTypes() {
    let debitCounter = 0;
    let creditCounter = 0;
    return this.fetchTransactions().then((transactions) => {
      transactions.forEach((transaction) => {
        if (transaction.transaction_type === "debit") {
          debitCounter++;
        } else if (transaction.transaction_type === "credit") {
          creditCounter++;
        }
      });
      if (debitCounter > creditCounter) {
        console.log("Дебетовых транзакций больше всего");
      } else if (debitCounter < creditCounter) {
        console.log("Кредитных транзакций больше всего");
      } else {
        console.log("Дебетовых и кредитных транзакций одинаковое количество");
      }
    });
  }
  // Очень долго не мог понять почему в консоли пустой вывод оказалось что если мы не преобразовываем параметр в date
  // то ничего не работает потому что разные типы и сравнение не проходит то есть мы даже в блок ифа не заходим и идем дальше
  getTransactionsBeforeDate(dateString) {
    //Массив куда мы будем пушить наши данные
    const arr = [];
    const date = new Date(dateString); // Преобразуем строку даты в объект Date
    return this.fetchTransactions().then((transactions) => {
      transactions.forEach((transaction) => {
        const transactionDate = new Date(transaction.transaction_date);
        if (transactionDate <= date) {
          arr.push(transaction);
        }
      });
      console.log(arr, "Транзакции до указанной даты");
      return arr;
    });
  }
  findTransactionById(id) {
    return this.fetchTransactions().then((transactions) => {
      //Еще можно проходится через фор ич по всем транзакциям и если айди совпадут то также возвращать переменную с транзакцией
      const transactionWithSelectedId = transactions.find(
        (transaction) => transaction.transaction_id === id
      );
      console.log(
        "Транзакция с вашим",
        id,
        "айди :",
        transactionWithSelectedId
      );
      return transactionWithSelectedId;
    });
  }
  mapTransactionDescriptions() {
    return this.fetchTransactions().then((transactions) => {
      const arrWithDescriptions = transactions.map(
        (transaction) => transaction.transaction_description
      );
      console.log(arrWithDescriptions, "Ваш массив с описаниями");
      return arrWithDescriptions;
    });
  }
}
//В константу засовываем файл который нам нужен и через фейк фетч апи получаем из него данные
const fileUrl = "transaction.json";
const transactionAnalyzer = new TransactionAnalyzer(fileUrl);
transactionAnalyzer.getAllTransactions();
//Здесь в качестве аргумента можно передавать что угодно и наверно это плохо
transactionAnalyzer.addNewTransaction("some transaction");
transactionAnalyzer.getUniqueTransactionType();
transactionAnalyzer.calculateTotalAmount();
//Важно указывать 3 аргумента именно так
transactionAnalyzer.calculateTotalAmountByDate(2019, 1, 1);
transactionAnalyzer.getTransactionByType("debit");
//Важно передавать в аргумент именно дату в такой структуре
transactionAnalyzer.getTransactionsInDateRange("2019-01-01", "2019-02-01");
//Очень важно писать название мерчанта в кэмел кейсе или ниче работать не будет(потому что так мы получаем данные из жсон объекта)
transactionAnalyzer.getTransactionsByMerchant("OnlineShop");
transactionAnalyzer.calculateAverageTransactionAmount();
transactionAnalyzer.getTransactionsByAmountRange(50, 150);
transactionAnalyzer.calculateTotalDebitAmount();
transactionAnalyzer.findMostTransactionsMonth();
transactionAnalyzer.findMostDebitTransactionMonth();
transactionAnalyzer.mostTransactionTypes();
//Важно правильно указать дату
transactionAnalyzer.getTransactionsBeforeDate("2019-02-01");
//Важно задавать аргумент именно в таком представление
transactionAnalyzer.findTransactionById("13");
transactionAnalyzer.mapTransactionDescriptions();
