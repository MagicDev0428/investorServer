import { Models } from "../../models"; 
const {getInvestorNickName} = require("../investor/getInvestor")
//
// creating investor table model
let myInvestmentTable = Models.myInvestmentsModel;


export const deleteMyInvestment = async (_id) => {
  global.show("###### deleteInvestor ######");
   return new Promise(async (resolve, reject) => {
      try{

    myInvestmentTable = null; // intializing table values null
    myInvestmentTable = await Models.myInvestmentsModel.findByIdAndDelete(_id); // passing id in delete function and storing response in investor table

    // checking that investor exist or not
    if (!myInvestmentTable) {
      return reject({
        err: true,
        message: "Investor id " + _id + " Not Found!",
      });
    }

    let  {investors} = await getInvestorNickName(myInvestmentTable.investorName)

      // this is for investment profit logs 
    let investmentProfit = 0
    if(myInvestmentTable.investType =='Monthly Profit' ||myInvestmentTable.investType =='Mixed'  ){
        investmentProfit = myInvestmentTable.profitMonthlyPct
    }else if(myInvestmentTable.investType =='Annual Profit' || myInvestmentTable.investType =='One-time Profit'){
        investmentProfit = myInvestmentTable.profitAnnualPct
    } 
    // save log for create my investment
    global.saveLogs({
        logType:'MY Investment',
        investorName:investors.nickname,
        investmentNo:myInvestmentTable.investmentNo,
        description:`Delete My Investment, ${investors.nickname} invested ${myInvestmentTable.amountInvested} in ${myInvestmentTable.investmentNo} at ${investmentProfit}%`,
    })
            

    // if investor exist then return all data
    return resolve({ err: false, investors: myInvestmentTable });
    } catch (error) {
       return reject({err:true,message:error.message})
    }
   })
}