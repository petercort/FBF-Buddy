name: Support Request
description: File a request for support.
title: "[Support Request]: "
labels: ["support", "triage"]
assignees:
  - petercort
body:
  - type: markdown
    attributes:
      value: |
        Thanks for taking the time to fill out this support request!
  - type: input
    id: contact
    attributes:
      label: Contact Details
      description: How can we get in touch with you if we need more info?
      placeholder: ex. email@example.com
    validations:
      required: false
  - type: textarea
    id: whats-up
    attributes:
      label: Whats Up?
      description: How can we help you today?
      placeholder: A nice message asking for what we can do for you.
      value: "I need more commands!"
    validations:
      required: true
