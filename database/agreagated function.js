async function runAggregation() {
  try {
    await client.connect();
    console.log("Connected to the database");

    const database = client.db("Mongo_Task");
    const investmentsCollection = database.collection("investments");
    const accountBalancesCollection = database.collection("accountBalances");

    const result = await investmentsCollection
      .aggregate([
        {
          $group: {
            _id: "$customer",
            Amount_Invested: { $sum: "$amountInvested" },
            Profit_PrMonth: { $sum: "$profitPrMonth" },
          },
        },
        {
          $lookup: {
            from: "accountBalances",
            let: { customer: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$customer", "$$customer"] },
                },
              },
              {
                $group: {
                  _id: null,
                  totalDeposit: { $sum: "$deposit" },
                  totalWithdraw: { $sum: "$withdraw" },
                },
              },
            ],
            as: "accountBalances",
          },
        },
        {
          $unwind: "$accountBalances",
        },
        {
          $project: {
            Name: "$_id",
            Amount_Invested: 1,
            Profit_PrMonth: 1,
            Total_Deposit: "$accountBalances.totalDeposit",
            Total_Withdraw: "$accountBalances.totalWithdraw",
            Total_Balance: {
              $subtract: [
                "$accountBalances.totalDeposit",
                "$accountBalances.totalWithdraw",
              ],
            },
            _id: 0, // Exclude the original _id field
          },
        },
        {
          $project: {
            Name: 1,
            Amount_Invested: 1,
            Profit_PrMonth: 1,
            Total_Deposit: 1,
            Total_Withdraw: 1,
            Total_Balance: 1,
          },
        },
      ])
      .toArray();

    const reorderedResult = result.map(({ Name, ...rest }) => ({
      Name,
      ...rest,
    }));

    console.table(reorderedResult);
  } finally {
    await client.close();
  }
}
