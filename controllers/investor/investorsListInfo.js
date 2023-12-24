//
//  info and list of all investors
//

import { Models } from "../../models"; 
// creating investor table model
let investorTable = Models.Investor;

const buttonColor = (emailDate,deposit,profitMonth,profitMonthPaid,totalInvestment)=>{
console.log(emailDate,deposit,profitMonth,profitMonthPaid,totalInvestment);
    const currentDate = new Date();
    const options = { year: 'numeric', month: 'short' };
    const formattedDate = currentDate.toLocaleDateString('en-US', options);
    const profitMonthDate = profitMonth.toLocaleDateString('en-US', options);

    if(formattedDate === profitMonthDate && profitMonthPaid){   // checking the date is equal to this month/year and profitMonthPaid is true
      
      // the deposit is >= to totalInvestment and emailDate exist then color will be Green
      if( deposit >= totalInvestment && emailDate){
        return "GREEN"
      }
      // the deposit is >= to totalInvestment  and email date does not exist then color will be Yellow
      else if( deposit >= totalInvestment  && !emailDate){
      return "YELLOW"
    }

    }
    // if deposit is not >= totalInvestment and profitMonthPaid is false  then color will be RED
    else if( !deposit >= totalInvestment  && !profitMonthPaid){
      console.log("------- i am else ");
      return "RED"
    }
   
      return "RED"
    
}

// Common function for the aggregation pipeline
const aggregateInvestorData = async (pipeline) => {
  return await Models.Investor.aggregate(pipeline);
};


// Inserting button color

const insertingButtonColor = (data)=>{
        data.forEach((investorInfo) => {
        if(!investorInfo.investor.getInvestmentType){
          investorInfo.investor.buttonColor = 'PURPLE'
        }
        else{
              investorInfo.investor.accountBalances.balanceList.forEach(async(balance) => {
              investorInfo.investor.buttonColor =  buttonColor(balance.emailDate,balance.deposit,balance.profitMonth,balance.profitMonthPaid,investorInfo.investor.totalInvestment)
           });
        }

});
return data;
}

// Common stages for the aggregation pipeline
const commonStages = [

  {
    $lookup: {
      from: "myInvestments",
      let: { investor: "$_id" },
      pipeline: [
        {
          $match: {
            $expr: { $eq: ["$investorName", "$$investor"] },
          },
        },
        {
          $group: {
            _id: null,
            totalInvested: { $sum: { $ifNull: ["$amountInvested", 0] }},
            totalProfitMonthly: { $sum: { $ifNull: ["$profitMonthly", 0] } },
           totalProfitEnd: { $sum: { $ifNull: ["$profitEnd", 0] } },
            myInvestmentList: {
                $push: "$$ROOT"
            },
          },
        },
      ],
      as: "accountInvestments",
    },
  },
  {
    $unwind: {
      path: "$accountInvestments",
      preserveNullAndEmptyArrays: true,
    },
  },
  {
     $addFields: {
      totalInvestment:"$accountInvestments.totalInvested",
      totalMonthlyProfit:"$accountInvestments.totalProfitMonthly",
      totalProfitEnd: "$accountInvestments.totalProfitEnd",
      totalProfit: {
        $add: ["$accountInvestments.totalInvested", "$accountInvestments.totalProfitMonthly", "$accountInvestments.totalProfitEnd"],
      },
      getInvestmentType:{
          $cond: {
              if: {
                $eq: [
                  {
                    $size: {
                      $filter: {
                                     input: {
                $ifNull: ['$accountInvestments.myInvestmentList', []],
              },
                        as: 'myInvestment',
                        cond: {
                          $or: [
                            { $eq: ['$$myInvestment.investType', 'Mixed'] },
                            { $eq: ['$$myInvestment.investType', 'Monthly Profit'] },
                          ],
                        },
                      },
                    },
                  },
                  1,
                ],
              },
              then: true,
              else: false,
        },
      }
     }
  },
  {
    $lookup: {
      from: "balance",
      let: { investor: "$_id" },
      pipeline: [
        {
          $match: {
            $expr: { $eq: ["$investorName", "$$investor"] },
          },
        },
        {
          $group: {
            _id: null,
            totalDeposit: { $sum: "$deposit" },
            totalWithdraw: { $sum: "$withdraw" },
            total_balance: {
              $sum: {
                $subtract: [{ $sum: "$deposit" }, { $sum: "$withdraw" }],
              },
            },
             balanceList: {
                $push: "$$ROOT"
            },
          },
        },
      ],
      as: "accountBalances",
    },
  },
  {
    $unwind: {
      path: "$accountBalances",
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $project: {
      investor: "$$ROOT",
    },
  },
];





// const fullPipeline = commonStages.concat(additionalStages);

exports.investorInfo = async (id) => {
  global.show("###### investorInfo ######");

  if (id) global.show(id);

  return new Promise(async (resolve, reject) => {
    try{
    // Check for id
    if (!id) {
      return reject({ err: true, message: "Didn't get investor id in params" });
    }

    // Check if the _id exists
    const existingInvestor = await Models.Investor.findById(id);

    if (!existingInvestor) {
      return reject({ err: true, message: "Your Investor Id does not exist!" });
    }

    // pipeline setup for aggregation
    const pipeline = [
      { $match: { _id: id } },
      ...commonStages, // Include common stages
    ];

    investorTable = null;
    investorTable = await aggregateInvestorData(pipeline); // calling  aggregation function for investor info

    // checking if investor data exist then resolve the promise otherwise reject it
    if (investorTable) {

      // calling a inserting button color which will insert color and return it
      // investorTable = insertingButtonColor(investorTable);

      return resolve({ err: false, investors: investorTable });
    
    }
    return reject({ err: true, message: "Unable to get investor info!" });
    } catch (error) {
       return reject({err:true,message:error.message})
    }
  });
};

exports.investorList = async () => {
  global.show("###### investorList ######");

  return new Promise(async (resolve, reject) => {

    try{
    //pipeline setup for aggregation
    const pipeline = [
      ...commonStages, // Include common stages
    ];

    investorTable = null;
    investorTable = await aggregateInvestorData(pipeline); // calling aggregation function for investor list

    // checking if investor data exist then resolve the promise otherwise reject it
    if (investorTable) {

      // calling a inserting button color which will insert color and return it
      // investorTable = insertingButtonColor(investorTable);
   
      return resolve({ err: false, investors: investorTable });
    }
    return reject({ err: true, message: "Unable to get investor list!" });
    } catch (error) {
       return reject({err:true,message:error.message})
    }
  });
};
