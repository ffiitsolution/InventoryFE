export const menu_en: any = [
  {
    "name": "Dashboard",
    "url": "/dashboard",
    "iconComponent": {
      "name": "cil-speedometer"
    }
  },
  {
    "name": "Master",
    "iconComponent": {
      "name": "cil-speedometer"
    },
    "children": [
      {
        "name": "Master User",
        "url": "/master/master-user"
      },
      {
        "name": "Master Branch",
        "url": "/master/master-branch"
      },
      {
        "name": "Master Departement",
        "url": "/master/master-department"
      },
      {
        "name": "Master Location",
        "url": "/master/master-location"
      },
      {
        "name": "Master Supplier",
        "url": "/master/master-supplier"
      },
      {
        "name": "Master Product",
        "url": "/master/master-product"
      },
      {
        "name": "Master RSC",
        "url": "/master/master-rsc"
      },
      {
        "name": "Master Regional",
        "url": "/master/master-regional"
      },
      {
        "name": "Master Area",
        "url": "/master/master-area"
      },
      {
        "name": "Master UOM",
        "url": "/master/master-uom"
      },
      {
        "name": "Master City Area",
        "url": "/master/master-city-area"
      },
      {
        "name": "Master Counter",
        "url": "/master/master-set-number"
      }
    ]
  },
  {
    "name": "Order",
    "url": "/order",
    "iconComponent": {
      "name": "cil-speedometer"
    },
    "badge": {
      "color": "info",
      "text": "NEW"
    },
    "children": [
      {
        "name": "Receive Order",
        "url": "/order/receiving-order"
      },
      {
        "name": "Send Order To Warehouse",
        "url": "/order/send-order-to-warehouse"
      }
    ]
  },
  {
    "name": "Tansaction",
    "url": "/transaction",
    "iconComponent": {
      "name": "cil-speedometer"
    },
    "badge": {
      "color": "info",
      "text": "NEW"
    },
    "children": [
      {
        "name": "Delivery Item",
        "url": "/transaction/delivery-item"
      }
    ]

  }
]
