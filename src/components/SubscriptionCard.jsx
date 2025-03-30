const SubscriptionCard = ({ title, description, price }) => {
    return (
      <div className="bg-white p-4 shadow-md rounded-md">
        <h3 className="text-lg font-bold">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
        <p className="text-sm font-semibold mt-2">{price}</p>
      </div>
    );
  };
  
  export default SubscriptionCard;
  