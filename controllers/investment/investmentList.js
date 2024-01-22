//
// Update Investment
//
import {
    Models
} from "../../models";

import { Lib } from "../../utils";
// creating table model
let investmentTable = Models.investmentModel;


const totalAmountInvestedAggregation =()=>
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
                        totalAmountInvested:{
                            $sum: {
                                    $ifNull: ["$amountInvested", 0]
                                }
                      },
                        
                    },
                },
            ],
            as: "myInvestments",
        },
    },
    {
        $unwind: {
            path: "$myInvestments",
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




//
// List all from investment collection
//
export const investmentList = () => {
    global.show("###### List of Investments ######");

    return new Promise(async (resolve, reject) => {
        try {

             
            investmentTable = null;
            investmentTable = await Models.investmentModel.aggregate([...totalAmountInvestedAggregation()])
            // investmentTable = await Models.investmentModel.find().sort({
            //     _id: 1
            // }).lean();


            if (investmentTable ) {
                console.log(investmentTable)
               
                // adding new property investment ends 
                investmentTable = investmentTable.map(investment_ => ({
                    
                    ...investment_.investment,
                    investmentEnds: Lib.calculateDays(investment_.investment.startDate, investment_.investment.endDate)
                }));
                return resolve({
                    err: false,
                    investments: investmentTable
                });
            }
            return reject({ 
                err: true,
                message: "Unable to receive investment list!"
            });

        } catch (error) {
            return reject({
                err: true,
                message: error.message
            })
        }
    });
};

