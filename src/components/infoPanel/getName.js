export default function getName(rider) {
  const { firstName, lastName } = rider;
  const displayFirstName = (firstName && (firstName.length + lastName.length) > 20)
        ? firstName.substring(0, 1)
        : (firstName || '');

  return `${displayFirstName} ${lastName}`.trim();
}
