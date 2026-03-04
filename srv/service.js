module.exports = (srv) => {
  const { Cars, CarCategories, Maintenance, Rentals } = cds.entities("CarRentalCompanyService");

  const checkOverlaping = async (data) => {
    const { car_licensePlate, startDate, endDate } = data;

    const maintenancePreviousData = await SELECT.from(Maintenance).columns("startDate", "endDate").where({ car_licensePlate: car_licensePlate });
    const rentalsPreviousData = await SELECT.from(Rentals).columns("rentalDate", "returnDate").where({ car_licensePlate: car_licensePlate });
    const startDateInMiliseconds = (new Date(startDate)).getTime();
    const endDateYearInMiliseconds = (new Date(endDate)).getTime();

    let isOverlapingByMaintenance = false;
    maintenancePreviousData.forEach((maintenance) => {
      const prevStartDateInMiliseconds = (new Date(maintenance.startDate)).getTime();
      const prevEndDateYearInMiliseconds = (new Date(maintenance.endDate)).getTime();

      isOverlapingByMaintenance = startDateInMiliseconds < prevEndDateYearInMiliseconds || endDateYearInMiliseconds > prevStartDateInMiliseconds;
    });

    let isOverlapingByRentals = false;
    rentalsPreviousData.forEach((rentals) => {
      const prevStartDateInMiliseconds = (new Date(rentals.rentalDate)).getTime();
      const prevEndDateYearInMiliseconds = (new Date(rentals.returnDate)).getTime();

      isOverlapingByRentals = startDateInMiliseconds < prevEndDateYearInMiliseconds || endDateYearInMiliseconds > prevStartDateInMiliseconds;
    });

    return { isOverlapingByMaintenance, isOverlapingByRentals };
  };

  srv.before("CREATE", "Cars.drafts", async (req) => {
    const { licensePlate = ''} = req.data;

    if (!licensePlate) {
      return;
    }

    const isLicensePlateExist = await SELECT.one.from(Cars).columns('licensePlate').where({ licensePlate: licensePlate });
    if (isLicensePlateExist) {
      req.error(409, `The ${licensePlate} License Plate isn't unique.`, "licensePlate");
    }

    const isTemplateMatched = /[A-Z]{3}-[0-9]{4}$/gm.exec(licensePlate);

    if (!isTemplateMatched) {
      req.error(409, `The ${licensePlate} License Plate should match template 'ABC-1234'.`, "licensePlate");
    }
  });

  const validateCarsDataBeforeSubmit = async (req) => {
    const { manufactureDate, price, category_code } = req.data;

    if (price !== undefined) {
      if (!Number.isInteger(price)) {
      req.error(400, `Price should be a number`, "price");
    }
    if (price <= 0) {
      req.error(400, `Price should be more than 0.`, "price");
    }
    }
    
    if (manufactureDate !== undefined) {
      const selectedYear = (new Date(manufactureDate)).getFullYear();
      if (!Number.isInteger(selectedYear)) {
        req.error(400, "Manufacture date should be a number.", "manufactureDate");
      } else {
        const currentYear = new Date().getFullYear();
        if (selectedYear > currentYear + 1)
          req.error(400, `Manufacture date should be less or equal than ${currentYear + 1}.`, "manufactureDate");
        if (selectedYear <= currentYear - 15)
          req.error(400, `Manufacture date should be equal or more than ${currentYear - 15}`, "manufactureDate");
      }
    }

    if (category_code !== undefined) {
      const isCategoryExist = await SELECT.one.from(CarCategories).columns("code").where({ code: category_code });
      if (!isCategoryExist) {
        req.error(400, "Wrong category was selected.", "category");
      }
    }
  }

  srv.before("UPDATE", "Cars.drafts", validateCarsDataBeforeSubmit);

  srv.before("SAVE", "Cars", validateCarsDataBeforeSubmit);

  const validateMaintenanceDataBeforeSubmit = (req) => {
    const { startDate, endDate } = req.data;

    const startDateInMiliseconds = (new Date(startDate)).getTime();
    const endDateYearInMiliseconds = (new Date(endDate)).getTime();

    if (startDateInMiliseconds > endDateYearInMiliseconds) {
      req.error(400, "Start dat eshould be earlier that end date", "endDate");
      return;
    }

    const { isOverlapingByMaintenance, isOverlapingByRentals } = checkOverlaping(req.data);

    if (isOverlapingByMaintenance) {
      req.error(409, "Maintenance periods shouldn't be overlapping with each other.", "startDate");
      return;
    }

    if (isOverlapingByRentals) {
      req.error(409, "Car can not be under maintenance if it is rented. Check for overlapping with rental periods.", "startDate");
      return;
    }
  };

  srv.before("SAVE", "Maintenance", validateMaintenanceDataBeforeSubmit);

  srv.before("UPDATE", "Maintenance.drafts", validateMaintenanceDataBeforeSubmit);

  srv.before("PATCH", "Maintenance.drafts", validateMaintenanceDataBeforeSubmit);
}