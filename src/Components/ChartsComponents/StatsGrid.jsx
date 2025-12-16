import { Container, Row, Col, Card, ProgressBar } from "react-bootstrap";
import { Car, DollarSign, Eye, Package, ShoppingCart, Users } from "lucide-react";
import {  useSelector } from "react-redux";

import { UserRole } from "../../Redux/slices/token";

import Loading from "../globalComonents/loading";

function StatsGrid() {

  const { orders } = useSelector((state) => state.Orders);
  const { users } = useSelector((state) => state.Users);
const { delegates } = useSelector((state) => state.Delegates);
const { products,loading } = useSelector((state) => state.Products);
 
  const today = new Date();
  const tenDaysAgo = new Date();
  tenDaysAgo.setDate(today.getDate() - 10);

  // فلترة الطلبات في آخر 10 أيام
  const recentOrders = orders?.filter((order) => {
    const orderDate = new Date(order.created_at || order.date);
    return orderDate >= tenDaysAgo && orderDate <= today;
  }) || [];

  const totalSales = recentOrders
    .filter(order => order.status === "done")
    .reduce((sum, order) => sum + (Number(order.total) || 0), 0);

  const totalOrdersCount = orders?.length || 0;

  const traderCount = users?.filter(user => user.role === "trader").length || 0;
  const DelegatesCount = delegates?.length || 0;
  const productsCount = products?.length || 0;
  const shopOwnerCount = users?.filter(user => user.role === "user").length || 0;

  const stats = [
    {
      title: "إجمالي المبيعات (آخر 10 أيام)",
      value: `${totalSales.toLocaleString()} ج.م`,
      icon: DollarSign,
      variant: "success",
    },
    {
      title: "عدد الطلبات",
      value: `${totalOrdersCount.toLocaleString()}`,
      icon: ShoppingCart,
      variant: "primary",
    },
    {
      title:UserRole=='admin'? "عدد التجار":'عدد المناديب',
      value: UserRole=='admin'?`${traderCount.toLocaleString()}`:`${DelegatesCount.toLocaleString()}`,
      icon:  UserRole=='admin'?Users:Car,
      variant: "warning",
    },
    {
      title: UserRole=='admin'?"عدد أصحاب المتاجر":'عدد المنتجات',
      value: UserRole=='admin'?`${shopOwnerCount.toLocaleString()}`:`${productsCount.toLocaleString()}`,
      icon:  UserRole=='admin'?Users:Package,
      variant: "danger",
    },
  ];

  return (
    <Container fluid>
       {loading&&<Loading/>}
      <Row>
        {stats.map((stat, index) => (
          <Col md={6} lg={3} key={index} className="mb-4">
            <Card className="h-100 shadow-sm border-light" style={{ borderRadius: "1.5rem" }}>
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <Card.Subtitle className="text-muted mb-1" style={{ fontSize: "0.8rem" }}>
                      {stat.title}
                    </Card.Subtitle>
                    <Card.Title className="fw-bold mb-1" style={{ fontSize: "1rem" }}>
                      {stat.value}
                    </Card.Title>
                  </div>
                  <div className={`p-3 bg-${stat.variant}-subtle`} style={{ borderRadius: "1.5rem" }}>
                    <stat.icon className={`text-${stat.variant}`} size={20} />
                  </div>
                </div>
                <ProgressBar
                  now={stat.trend === "up" ? 75 : 45}
                  variant={stat.variant}
                  className="mt-2"
                  style={{ height: "4px" }}
                />
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
     
    </Container>
  );
}

export default StatsGrid;
