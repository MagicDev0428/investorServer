import {
    Models
} from "../../models";
// creating myInvestment table model
let myInvestmentTable = Models.myInvestmentsModel;


// Helper function to check if it's in the same month but after the start date
function isAnniversary(startDate, currentDate) {
  const start = new Date(startDate);
  return start.getMonth() === currentDate.getMonth() && start <= currentDate && start.getFullYear()<currentDate.getFullYear();
}

// Helper function to check if it's a specific date for a one-time payment
function isSpecificDate(specificDate, currentDate) {
  const date = new Date(specificDate);
  return  date.getMonth() === currentDate.getMonth() && date.getFullYear() === currentDate.getFullYear();
}

const calcaulateProfit = async (filteredInvestments,currentDate)=>{

    // Calculate total profit based on investment type and payment status
    let totalProfit = 0;
    let profitOtherPaid = false;
    let profitMonthPaid = false;

    for (const investment of filteredInvestments) {
      if (investment.investType === 'Monthly Profit') {
        profitMonthPaid = true;
        totalProfit += investment.profitMonthly;
      } else if (investment.investType === 'Annual Profit') {
        if (isAnniversary(investment.firstProfitDate, currentDate)) {
            profitOtherPaid = true;
          totalProfit += investment.profitAnnual;
        }
      } else if (investment.investType === 'One-time Profit') {
        if (isSpecificDate(investment.firstProfitDate, currentDate)) {
            profitOtherPaid = true;
            totalProfit += investment.profitOneTime;
        }
      }
    }
    return {totalProfit,profitOtherPaid,profitMonthPaid}
}


// investor Monthly Profit for Month
export const investorMonthlyDeposit = (investorId)=>{

    global.show("###### Investor Monthly Profit ######");
    if (investorId) global.show(investorId);

        return new Promise(async (resolve, reject) => {
        try {  
            
            if (!investorId) {
                return reject({
                    err: true,
                    message: "Didn't get investor id in params."
                });
            }

            const existingInvestor = await Models.Investor.exists({_id:investorId});
            if(!existingInvestor){
                return reject({
                    err:true,
                    message:"Investor Id does not exist!"
                })
            }

                // Get the current date
            const currentDate = new Date();

            // Find investments for the specific investor where the current date is within the range
            const filteredInvestments = await Models.myInvestmentsModel.find({
      investorName: investorId,
      $expr: {
        $and: [
          {
            $lte: [
              {
                $substr: ['$firstProfitDate', 0, 7], // Extracts the year and month part
              },
              {
                $dateToString: {
                  format: '%Y-%m',
                  date: currentDate,
                },
              },
            ],
          },
          {
            $gte: [
              {
                $substr: ['$lastProfitDate', 0, 7], // Extracts the year and month part
              },
              {
                $dateToString: {
                  format: '%Y-%m',
                  date: currentDate,
                },
              },
            ],
          },
        ],
      },
    });
    

            console.log(filteredInvestments);
             const {totalProfit,profitOtherPaid,profitMonthPaid } = await calcaulateProfit(filteredInvestments,currentDate);

             return resolve({
                err:false,
                depositInfo:{totalProfit,profitOtherPaid,profitMonthPaid }
             })
        } catch (error) {
            return reject({
                status:500,
                err: true,
                message: error.message
            })
        }
    });
}