
import {
    Models
} from '../../models';


// creating Investment table model
let investmentTable = Models.investmentModel

const investmentAggregateStages =   [
      {
        $group: {
          _id: null,
          totalInvestment: { $sum: '$investAmount' },
          totalMonthlyProfit: { $sum: '$profitMonthly' },
          investments: { $push: '$$ROOT' },
        },
      },
    ]

export const allInvestments = (req) => {
    global.show("###### all investments ######");
    let received = req ? req.body : null;
    if (received) global.show({
        received
    });

    return new Promise(async (resolve, reject) => {

        try {
            
                        // pipeline setup for aggregation
            const pipeline = [
                ...investmentAggregateStages, // Include aggregate stages
            ];

           investmentTable = null;
            // investmentTable = await aggregateInvestmentData(pipeline); 
            investmentTable = await Models.investmentModel.aggregate(pipeline);

            if(!investmentTable){
                return reject({
                err: true,
                message: "Unable to get all investments data!"
            })
            }
            return resolve({
                err: false,
                allInvestments: investmentTable
            })
        } catch (error) {
            return reject({
                status:500,
                err: true,
                message: error.message
            })
        }

    })



}
