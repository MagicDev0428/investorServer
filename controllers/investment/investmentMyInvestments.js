//
// Get  Investment
//

import {
    Models
} from '../../models';

// creating Investment table model
let investmentTable = Models.investmentModel

const investmentAggregateStages =()=>
{
 return [
    {
        $lookup: {
            from: "myInvestments",
            let: {
                investment: "$_id"
            },
            pipeline: [{
                    $match: {
                        $expr: {
                            $eq: ["$investmentNo", "$$investment"]
                        },
                    },
                },
                {
                    $group: {
                        _id: null,
                      
                        myInvestmentsList: {
                            $push: "$$ROOT"
                        },
                    },
                },
            ],
            as: "myInvestmentsList",
        },
    },
    {
        $unwind: {
            path: "$myInvestmentsList",
            preserveNullAndEmptyArrays: true,
        },
    },
    {
        $project: {
            investment: "$$ROOT",
        },
    },
];
}



export const getAllMyInvestmentsOfInvestment = (investmentNo)=>{
    global.show("###### Get all myInvestments of this investment ######");
    if (investmentNo) global.show(investmentNo);

        return new Promise(async (resolve, reject) => {
        try {       
                        // Check for received data
            if (!investmentNo) {
                return reject({
                    error: true,
                    message: "Investment No. is not recieved."
                });
            }

                      // check recieved._id exists
            const investmentExists = await Models.investmentModel.exists({
                _id: investmentNo,
            });

            if (!investmentExists) {
                return reject({
                    err: true,
                    message: `Investment No. ${investmentNo} is not exist!`,
                });
            }


            // pipeline setup for aggregation
            const pipeline = [{
                    $match: {
                        _id: Number(investmentNo)
                    }
                },

                ...investmentAggregateStages(), // Include aggregate stages
            ];



            investmentTable = null;
            // investmentTable = await aggregateInvestmentData(pipeline); 
            investmentTable = await Models.investmentModel.aggregate(pipeline);

            return resolve({
                err: false,
                investmentInfo: investmentTable
            })
         } catch (error) {
            return reject({
                err: true,
                message: error.message
            })
        }
    });

}