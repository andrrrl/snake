    // Tests that the function sends the joystick value to all clients with a valid joystick value
    it('should send joystick value to all clients with a valid joystick value', () => {
        const mockClient1 = { response: { write: jest.fn() } };
        const mockClient2 = { response: { write: jest.fn() } };
        clients = [mockClient1, mockClient2];
        const joystickValue = 'ArrowUp';
    
        sendEventsToAll(joystickValue);
    
        expect(mockClient1.response.write).toHaveBeenCalledWith(`data: ${JSON.stringify(joystickValue)}\n\n`);
        expect(mockClient2.response.write).toHaveBeenCalledWith(`data: ${JSON.stringify(joystickValue)}\n\n`);
      });