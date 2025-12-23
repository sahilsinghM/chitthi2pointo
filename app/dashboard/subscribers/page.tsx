import SubscriberManager from "../../components/SubscriberManager";

export default function SubscribersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Subscribers</h1>
        <p className="text-sm text-slate-600">
          Add subscribers, import lists, manage tags, and handle unsubscribes.
        </p>
      </div>
      <SubscriberManager />
    </div>
  );
}
