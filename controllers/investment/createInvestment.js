//
// Create Investment
//

import { Models } from '../../models';

// creating Investment table model
let investmentTable = Models.investmentModel


//
// Create NEW investment with the data from the form
//

exports.createInvestment = (req) => {
  global.show("###### investmentCreate ######");
  let received = req ? req.body : null;
  if (received) global.show({ received });

  return new Promise(async (resolve, reject) => {

    try{
        // Checking if investor body is empty or not
        if (!received) {
            return reject({
                err: true,
                message: "investment form is empty!",
            });
        }

        // investment id is required
        if (!received._id) {
          return reject({
            err: true,
            message: "investment id is empty!",
          });
        }


        // checking investment recieved._id already exists
        const investmentExists = await Models.investmentModel.exists({
              _id: received?._id,
            });
        if (investmentExists)
            return reject({
            err: true,
            message: `Investment id ${received._id} is already exist!`,
        });

        // received._id = new Date().getTime();
        // creating new investment instance
        const newinvestment = new Models.investmentModel(received);

        investmentTable = null;
        investmentTable = await newinvestment.save();

        // global.saveLog(
        //   global.adminNick,
        //   "investment",
        //   investmentTable.investorName,
        //   investmentTable.investmentNo,
        //   "Created transaction: " +
        //     formatDateTime(investmentTable._id) +
        //     " " +
        //     investmentTable.desctiption
        // );

        if (investmentTable){
             return resolve({ status: 201, err: false, investments: investmentTable });
        }
        return reject({
        status: 500,
        err: true,
        message: "Error in investment creation!",
        });
     } catch (error) {
       return reject({err:true,message:error.message})
    }
  });
};