import PlanCard from "../components/PlanCard";
import SubscriptionCard from "../components/SubscriptionCard";

const Profile = () => {
  return (
    <div className="max-w-4xl mx-auto mt-20 p-6">
      <h1 className="text-3xl font-bold mb-6">Profile</h1>

      {/* My Plans Section */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">My Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PlanCard title="Plan A" description= " This is a long Plan A description" price="$10/month" provider="BlaBla"/>
          <PlanCard title="Plan B" description="Plan B description" price="$20/month" provider="BlaBla"/>
        </div>
      </section>

      {/* My Subscriptions Section */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">My Subscriptions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SubscriptionCard title="Netflix" description="Streaming service" price="$15/month" />
          <SubscriptionCard title="Spotify" description="Music subscription" price="$9.99/month" />
        </div>
      </section>

      {/* Subscribers Section */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Subscribers</h2>
        <div className="bg-white p-4 shadow-md rounded-md">List of subscribers goes here...</div>
      </section>
    </div>
  );
};

export default Profile;
