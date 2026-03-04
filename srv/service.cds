using sap.carRentalCompany from '../db/schema.cds';

service CarRentalCompanyService {
    @odata.draft.enabled
    entity Cars          as
        projection on carRentalCompany.Cars {
            *,
            (
                case
                    when exists rentals[rentalDate < $now
                         and returnDate            > $now]
                         then 'STATUS_2'
                    when exists maintenance[startDate < $now
                         and endDate                  > $now]
                         then 'STATUS_1'
                    else 'STATUS_3'
                end
            ) as status : CarStatuses:code,
            statusData  : Association to CarStatuses
                              on statusData.code = status,
        };

    entity Customers     as projection on carRentalCompany.Customers;
    entity Rentals       as projection on carRentalCompany.Rentals;
    entity Maintenance   as projection on carRentalCompany.Maintenance;
    entity CarStatuses   as projection on carRentalCompany.CarStatuses;
    entity CarCategories as projection on carRentalCompany.CarCategories;
}

annotate carRentalCompany.Rentals with @Capabilities.InsertRestrictions.Insertable: false;
