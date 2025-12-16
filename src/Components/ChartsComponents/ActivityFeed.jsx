import { Clock, ShoppingCart, User } from "lucide-react";

import moment from "moment";

import { UserRole } from "../../Redux/slices/token";
import { useSelector } from "react-redux";

function ActivityFeed() {

  const { orders } = useSelector((state) => state.Orders);
  const { users } = useSelector((state) => state.Users);


    // تأكد من وجود created_at قبل الاستخدام
    let userActivities = users
        ?.filter((user) => user.created_at)
        .map((user) => ({
            id: `user-${user.id}`,
            type: "user",
            title: "تم تسجيل حساب جديد",
            description: `${user.name} قام بعمل حساب جديد`,
            time: user.created_at,
            icon: User,
            color: "text-primary",
            bgColor: "bg-primary-subtle",
        }))||[] ;

    const orderActivities = orders
        ?.filter((order) => order.created_at)
        .map((order) => ({
            id: `order-${order.id}`,
            type: "order",
            title: "طلب جديد",
            description: `طلب بقيمة ${order.total ?? "غير محددة"} جنيه`,
            time: order.created_at,
            icon: ShoppingCart,
            color: "text-success",
            bgColor: "bg-success-subtle",
        })) || [];

if (UserRole=='trader') {
    userActivities=[];
}

    const activities = [...userActivities, ...orderActivities]
        .sort((a, b) => new Date(b.time) - new Date(a.time))
        .slice(0, 10); 



    return (
        <div className="card overflow-hidden overflow-y-scroll border-0" style={{ height: "378px" }}>
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
                <div className="py-2">
                   <h5 className="card-title mb-0 fw-bold" style={{color: "#7b7686"}}>آخر الأحداث</h5>
                    <small className="text-muted">آخر إشعارات النظام</small>
                </div>
                {/* <button className="btn btn-link btn-sm">عرض الكل</button> */}
            </div>
            <div className="card-body">
                <div className="list-group list-group-flush">
                    {activities.map((activity) => (
                        <div
                            key={activity.id}
                            className="list-group-item list-group-item-action d-flex align-items-start p-3  gap-2"
                        >
                            <div className={`p-2 rounded-2 ${activity.bgColor} me-3`}>
                                <activity.icon
                                    className={`${activity.color}`}
                                    style={{ width: "1rem", height: "1rem" }}
                                />
                            </div>
                            <div className="flex-grow-1 min-w-0">
                                <h6 className="fw-semibold mb-0">{activity.title}</h6>
                                <p className="text-secondary text-truncate mb-1 small">
                                    {activity.description}
                                </p>
                                <div className="d-flex align-items-center gap-1">
                                    <Clock
                                        className="text-muted"
                                        style={{ width: "0.75rem", height: "0.75rem" }}
                                    />
                                    <small className="text-muted">
                                        {moment(activity.time).fromNow()}
                                    </small>
                                </div>
                            </div>
                        </div>
                    ))}
                    {activities.length === 0 && (
                        <div className="text-muted text-center mt-3">لا يوجد أحداث حالياً</div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ActivityFeed;
