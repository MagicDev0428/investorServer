export async function calculateWithdrawalAmounts(amountForm) {

    return new Promise(async (resolve, reject) => {
        try {
            if (!amountForm) {
                return reject({
                    err: true,
                    message: "Amount is required!",
                });
            }

            const amount = parseFloat(amountForm.replace(/,/g, ''));
            if (isNaN(amount)) {
                return reject({
                    err: true,
                    message: "Invalid amount format!",
                });
            }

            // Calculate the number of each bill and coin for the investor
            const num1000 = Math.floor(amount / 1000);
            const num500 = Math.floor((amount % 1000) / 500);
            const num100 = Math.floor((amount % 500) / 100);
            const num50 = Math.floor((amount % 100) / 50);
            const num20 = Math.floor((amount % 50) / 20);
            const num10 = Math.floor((amount % 20) / 10);
            const num5 = Math.floor((amount % 10) / 5);
            const num2 = Math.floor((amount % 5) / 2);
            const num1 = Math.floor(amount % 2);


            const moneyForEnvelop = {
                num1000: num1000 > 0 ? num1000 : undefined,
                num500: num500 > 0 ? num500 : undefined,
                num100: num100 > 0 ? num100 : undefined,
                num50: num50 > 0 ? num50 : undefined,
                num20: num20 > 0 ? num20 : undefined,
                num10: num10 > 0 ? num10 : undefined,
                num5: num5 > 0 ? num5 : undefined,
                num2: num2 > 0 ? num2 : undefined,
                num1: num1 > 0 ? num1 : undefined,
                total: amountForm
            };

            return resolve({
                status: 201,
                err: false,
                moneyForEnvelop
            });
        } catch (error) {
            return reject({
                err: true,
                message: error.message
            })
        }
    });
}