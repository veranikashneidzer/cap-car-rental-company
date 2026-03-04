using CarRentalCompanyService as service from '../../srv/service';

annotate service.Cars with @(
    UI : {
        HeaderInfo : {
            $Type : 'UI.HeaderInfoType',
            TypeName : '{i18n>car}',
            TypeNamePlural : '{i18n>cars}',
            Title: {
                $Type: 'UI.DataFieldForAnnotation',
                Target: '@UI.ConnectedFields#headerTitle',
            },
            Description: {
                $Type: 'UI.DataField',
                Label: '{i18n>licensePlate}',
                Value: licensePlate,
            },
            
        },
        HeaderFacets : [
            {
                $Type  : 'UI.ReferenceFacet',
                ID : 'ManufactureDate',
                Target : '@UI.FieldGroup#generatedGroup'
            },
        ],
        FieldGroup #generatedGroup : {
            $Type : 'UI.FieldGroupType',
            Data : [
                {
                    $Type : 'UI.DataField',
                    ID : 'Brand',
                    Label : '{i18n>brand}',
                    Value : brand,
                },
                {
                    $Type : 'UI.DataField',
                    ID : 'Model',
                    Label : '{i18n>model}',
                    Value : model,
                },
                {
                    $Type : 'UI.DataField',
                    ID : 'ManufactureDate',
                    Label : '{i18n>manufactureDate}',
                    Value : manufactureDate,
                },
                {
                    $Type : 'UI.DataField',
                    ID : 'Price',
                    Label : '{i18n>price}',
                    Value : price,
                },
                {
                    $Type : 'UI.DataField',
                    ID : 'Category',
                    Label : '{i18n>category}',
                    Value : category_code,
                },
                {
                    $Type: 'UI.DataField',
                    Label: '{i18n>Status}',
                    Value: status,
                    Criticality: statusData.criticality
                },
            ],
        },
        LineItem : [
            {
                $Type: 'UI.DataField',
                Label: '{i18n>licensePlate}',
                Value: licensePlate,
            },
            {
                $Type: 'UI.DataField',
                Label: '{i18n>brand}',
                Value: brand,
            },
            {
                $Type: 'UI.DataField',
                Label: '{i18n>model}',
                Value: model,
            },
            {
                $Type: 'UI.DataField',
                Label: '{i18n>manufactureDate}',
                Value: manufactureDate,
            },
            {
                $Type: 'UI.DataField',
                Label: '{i18n>price}',
                Value: price,
            }
        ],
        Facets : [
            {
                $Type : 'UI.ReferenceFacet',
                Label : '{i18n>rentals}',
                ID    : 'Rentals',
                Target: 'rentals/@UI.LineItem#rentals',
            },
            {
                $Type : 'UI.ReferenceFacet',
                Label : '{i18n>maintenance}',
                ID    : 'Maintenance',
                Target: 'maintenance/@UI.LineItem#maintenance',
            }
        ],
        SelectionFields : [
            category_code,
            status,
            manufactureDate,
            licensePlate
        ],
        ConnectedFields #headerTitle : {
            $Type : 'UI.ConnectedFieldsType',
            Template : '{Brand} {Model}',
            Data : {
                $Type : 'Core.Dictionary',
                Brand : {
                    $Type : 'UI.DataField',
                    Value : brand,
                },
                Model : {
                    $Type : 'UI.DataField',
                    Value : model,
                },
            },
        },
    },
);

annotate service.Cars with {
    status @Common.ValueListWithFixedValues: true;
    status @Common.Text: statusData.label;
    status @(
        Common.TextArrangement: #TextOnly,
        Common.ValueList : {
            $Type : 'Common.ValueListType',
            CollectionPath : 'CarStatuses',
            Parameters : [
                {
                    $Type : 'Common.ValueListParameterInOut',
                    LocalDataProperty : status,
                    ValueListProperty : 'code',
                },
            ],
        },
    );
    category @Common.ValueListWithFixedValues: true;
    category @Common.Text: category.name;
    category @(
        Common.TextArrangement: #TextOnly,
        Common.ValueList : {
            $Type : 'Common.ValueListType',
            CollectionPath : 'CarCategories',
            Parameters : [
                {
                    $Type : 'Common.ValueListParameterInOut',
                    LocalDataProperty : category_code,
                    ValueListProperty : 'code',
                },
            ],
        },
    );
};

annotate service.Cars with {
    status       @Common.Label: '{i18n>status}';
    category     @Common.Label: '{i18n>category}';
    licensePlate @Common.Label: '{i18n>licensePlate}';
    manufactureDate @Common.Label: '{i18n>manufactureDate}';
    brand        @Common.Label: '{i18n>brand}';
    model        @Common.Label: '{i18n>model}';
};

annotate service.Rentals with @(
    UI : {
        LineItem #rentals: [
            {
                $Type: 'UI.DataField',
                Value: customer_driverLicenseNumber,
                Label: '{i18n>customerDriverLicenseNumber}',
            },
            {
                $Type: 'UI.DataField',
                Value: car_licensePlate,
                Label: '{i18n>carLicensePlate}',
            },
            {
                $Type: 'UI.DataField',
                Value: rentalDate,
                Label: '{i18n>rentalDate}',
            },
            {
                $Type: 'UI.DataField',
                Value: returnDate,
                Label: '{i18n>returnDate}',
            },
            {
                $Type: 'UI.DataField',
                Value: price,
                Label: '{i18n>price}',
            },
        ]
    }
);

annotate service.Maintenance with @(
    UI : {
        LineItem #maintenance: [
            {
                $Type: 'UI.DataField',
                Value: car_licensePlate,
                Label: '{i18n>carLicensePlate}',
            },
            {
                $Type: 'UI.DataField',
                Value: startDate,
                Label: '{i18n>startDate}',
            },
            {
                $Type: 'UI.DataField',
                Value: endDate,
                Label: '{i18n>endDate}',
            },
            {
                $Type: 'UI.DataField',
                Value: issue,
                Label: '{i18n>issueDescription}',
            },
            {
                $Type: 'UI.DataField',
                Value: cost,
                Label: '{i18n>cost}',
            }
        ]
    }
);
annotate service.CarCategories with {
    code @(
        Common.Text : name,
        Common.Text.@UI.TextArrangement : #TextOnly,
)};

annotate service.CarStatuses with {
    code @(
        Common.Text : label,
        Common.Text.@UI.TextArrangement : #TextOnly,
)};

