//
// Get  Investment
//

import { Models } from '../../models';

// creating Investment table model
let investmentTable = Models.investmentModel

// Common function for the aggregation pipeline
const aggregateInvestmentData = async (pipeline) => {
  return await Models.investmentModel.aggregate(pipeline);
};



// Aggregation stages for pipeline
const aggregateStages = [
  {
    $lookup: {
      from: "myInvestments",
      let: { investment: "$_id" },
      pipeline: [
        {
          $match: {
            $expr: { $eq: ["$investmentNo", "$$investment"] },
          },
        },
        {
          $group: {
            _id: null,
            sumOfTotalAmountInvested: { $sum: "$amountInvested" },
            // totalWithdraw: { $sum: "$withdraw" },
            // total_balance: {
            //   $sum: {
            //     $subtract: [{ $sum: "$deposit" }, { $sum: "$withdraw" }],
            //   },
            // },
            myInvestments: { $push: "$$ROOT" }, 
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
      investments: "$$ROOT",
    },
  },
];



//
// Get all data used on the investment form
//
exports.investmentInfo  = (investmentId) => {

	global.show("###### investmentInfo ######")
	if (investmentId) global.show(investmentId);

	// Input from recieved:
	// - recieved._id (the investments unique key of investments collection)

	return new Promise( async(resolve, reject) => {

  try{
		// Check for investmentId data
		if (!investmentId) {
			return reject({err:true, message:"Nothing investmentId from caller"})
		}

		// investment ID missing (_id)
		if (!investmentId) {
			return reject({err:true, message:`investment id ${investmentId} is not missing!`})
		}
	
        // check recieved._id exists
        const investmentExists = await Models.investmentModel.exists({
            _id: investmentId,
        });

        if (!investmentExists) {
            return reject({
                err: true,
                message: `investment id ${investmentId} is not exist!`,
            });
        }

       
         // pipeline setup for aggregation
        const pipeline = [
        { $match: { _id: Number(investmentId) } },
        
          ...aggregateStages, // Include common stages
        ];



		    investmentTable = null;
        // investmentTable = await aggregateInvestmentData(pipeline); 
        investmentTable = await Models.investmentModel.aggregate(pipeline);

        return resolve({err:false, investmentInfo:investmentTable})


		// This one is a bit tricky, I would probably do it with one big aggregate or with several seperate find()
		// You need to find the investment in the investment collection of cause
////
		// Then you need to find all records in myInvestment where myInvestment.investmentNo = received._id
		// And sum of myInvestment.amountInvested for all records found and send that to client also 
//////
        // And investment.investAmount MINUS sum of myInvestment.amountInvested and send that to client also 

		// Then you need to find all records in adam where adam.investmentNo = received._id
		// And sum of adam.amount for all records found and send that to client also 

        // Then you need to find all records in log where log.investmentNo = received._id
		// And finally send all this data to the client 

		// Also, you need to send amount of days till investment expires to the client. 
		// investment.endDate - investment.startDate (and convert that to number of days)

		// investmentTable = await investmentModel.findOne( { "_id" : received._id } );
		// if (!investmentTable) {
		//	return reject( "investment " + received._id + "Not Found!" )
		// }

		// return resolve( { err:false,  investments: investmentTable, myInvestments: myInvestmentTable, adam: adamTable, log: logTable } );
	 } catch (error) {
       return reject({err:true,message:error.message})
    }
    });
    
}
