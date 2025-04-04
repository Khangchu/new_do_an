import { CollectionConfig } from "payload";

export const ProductionPlans: CollectionConfig = {
    slug: 'ProductionPlans',
    labels: {
        singular: 'Kế Hoạch Phát Triển Sản Phẩm',
        plural: 'Kế Hoạch Phát Triển Sản Phẩm',
    },
    admin: {
        useAsTitle: "planID"
    },
    fields: [
        {
            name: 'planID',
            label: 'ID Kế Hoạch',
            type : 'text'
        },
        {
            name: 'productID',
            label: 'ID Sản Phẩm',
            type : 'text'
        },
        {
            name: 'quantity',
            label: 'Số lượng sản xuất',
            type: 'number'
        },
        {
            name: 'startDate',
            label: 'Ngày bắt đầu',
            type: 'date',
        },
        {
            name: 'endDate',
            label: 'Ngày kết thúc',
            type: 'date'
        },
        {
            name: 'status',
            label: 'Trạng thái',
            type: 'select',
            options: [
                {
                    label: 'đang chờ',
                    value :'đang chờ'
                },
                {
                    label: 'đang sản xuất',
                    value: 'đang sản xuất'
                },
                {
                    label:'hoàn thành',
                    value: 'hoàn thành'
                }
            ]
        },
        {
            name: 'assignedTo',
            label: 'ID nhân viên phụ trách',
            type: 'text'
        },
        {
            label: 'vật liệu sử dụng',
            type: 'collapsible',
            fields: [
                {
                    name: 'materialId',
                    label: 'ID Vật Liệu',
                    type: 'text'
                },
                {
                    name: 'materialQuantity',
                    label: 'Số Lượng ',
                    type: 'number'
                }
            ]
        },
    ]
}