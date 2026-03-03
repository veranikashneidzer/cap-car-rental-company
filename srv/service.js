module.exports = (srv) => {
  const { Cars, CarCategories, Maintenance, Rentals } = cds.entities("CarRentalCompanyService");

  const STATUSES = { 
    STATUS_3: {
      code: 'STATUS_3',
      label: 'Available',
      criticality: 3
    },
    STATUS_2: {
      code: 'STATUS_2',
      label: 'Rented',
      criticality: 2
    },
    STATUS_1: {
      code: 'STATUS_1',
      label: 'Under Maintenance',
      criticality: 1
    }
  };

    const checkOverlaping = async (data, tx) => {
    const { car_licensePlate, startDate, endDate } = data;

    const maintenancePreviousData = await tx.run(
      SELECT.from(Maintenance)
            .columns("startDate", "endDate")
            .where({ car_licensePlate: car_licensePlate })
    );

    const rentalsPreviousData = await tx.run(
      SELECT.from(Rentals)
            .columns("rentalDate", "returnDate")
            .where({ car_licensePlate: car_licensePlate })
    );

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
    const tx = cds.transaction(req);

    if (!licensePlate) {
      return;
    }

    const isLicensePlateExist = await tx.run(
      SELECT.one
            .from(Cars)
            .columns('licensePlate')
            .where({ licensePlate: licensePlate })
    );

    if (isLicensePlateExist) {
      req.error(409, `The ${licensePlate} License Plate isn't unique.`, "licensePlate");
    }

    const isTemplateMatched = /[A-Z]{3}-[0-9]{4}$/gm.exec(licensePlate);

    if (!isTemplateMatched) {
      req.error(409, `The ${licensePlate} License Plate should match template 'ABC-1234'.`, "licensePlate");
    }
  });

  srv.after("READ", "Cars", (cars, req) => {
    const tx = cds.transaction(req);

    console.log('READ cars', cars);

    cars.forEach((car) => {
      const { isOverlapingByMaintenance, isOverlapingByRentals } = checkOverlaping(car, tx);

      if (isOverlapingByMaintenance) {
        car.statusData = STATUSES['STATUS_1'];
      } else if (isOverlapingByRentals) {
        car.statusData = STATUSES['STATUS_2'];
      } else {
        car.statusData = STATUSES['STATUS_3'];
      }
    });
  });

  const validateCarsDataBeforeSubmit = async (req) => {
    const { manufactureDate, price, status_code, category_name } = req.data;
    const tx = cds.transaction(req);

    if (price) {
      if (!Number.isInteger(price)) {
        req.error(400, `Price should be a number`, "price");
      } else if (price <= 0) {
        req.error(400, `Price should be more than 0.`, "price");
      }
    }
    
    if (manufactureDate) {
      const selectedYear = (new Date(manufactureDate)).getFullYear();
      if (!Number.isInteger(selectedYear)) {
        req.error(400, "Manufacture date should be a number.", "manufactureDate");
      } else {
        const maxYear = new Date().getFullYear();
        if (selectedYear > maxYear)
          req.error(400, `Manufacture date should be less or equal than ${maxYear}.`, "manufactureDate");
        if (selectedYear < maxYear - 15)
          req.error(400, `Manufacture date should be equal or more than ${maxYear - 15}`, "manufactureDate");
      }
    }

    if (category_name) {
      const isCategoryExist = await tx.run(
        // SELECT.one
        //       .from(CarCategories)
        //       .columns("name")
        //       .where({ name: category_name })
      );
      if (!isCategoryExist)
        req.error(400, "Wrong category was selected.", "category");
    }

    if (!STATUSES[status_code]) {
      req.error(400, "Wrong status was selected.", "status_code");
    }
  }

  srv.before("UPDATE", "Cars.drafts", validateCarsDataBeforeSubmit);

  srv.before("SAVE", "Cars", validateCarsDataBeforeSubmit);

  const validateMaintenanceDataBeforeSubmit = (req) => {
    const { startDate, endDate } = req.data;
    const tx = cds.transaction(req);

    const startDateInMiliseconds = (new Date(startDate)).getTime();
    const endDateYearInMiliseconds = (new Date(endDate)).getTime();

    if (startDateInMiliseconds > endDateYearInMiliseconds) {
      req.error(400, "Start dat eshould be earlier that end date", "endDate");
      return;
    }

    const { isOverlapingByMaintenance, isOverlapingByRentals } = checkOverlaping(req.data, tx);

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