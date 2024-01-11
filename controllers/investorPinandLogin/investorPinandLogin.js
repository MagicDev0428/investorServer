import {
    Models
} from "../../models";


// update investor last login date and time 
export const lastLoginDate = (investorId) => {
    global.show("###### Investor Last Login ######")

    return new Promise(async (resolve, reject) => {
        try {

            const newLastLoginDate = new Date();
            // validating id and nickname are exist or not
            if (!investorId) {
                return reject({
                    status: 404,
                    err: true,
                    message: "Investor Id is required for update login date.",
                });
            }
            const updatedInvestorLoginDate = await Models.Investor.findByIdAndUpdate(
                investorId, {
                    $set: {
                        LastLoginDate: newLastLoginDate
                    }
                }, {
                    new: true
                }
            );

            // Return investor update data
            if (updatedInvestorLoginDate) {
                return resolve({
                    status: 200,
                    err: false,
                    investors: "Investor Login Date has been updated successfully"
                });
            }

            return reject({
                status: 400,
                err: true,
                message: "Investor not found!"
            });
        } catch (error) {
            return reject({
                status: 500,
                err: true,
                message: error.message
            })
        }
    })
}