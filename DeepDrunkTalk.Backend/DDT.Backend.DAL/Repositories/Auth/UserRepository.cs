using DDT.Backend.Common;
using DDT.Backend.Common.Exceptions;
using DDT.Backend.Common.Interfaces;
using DDT.Backend.Common.Logger;
using DDT.Backend.Common.Models;
using Microsoft.EntityFrameworkCore;

namespace DDT.Backend.DAL.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly ILogger _logger;
        private readonly ApplicationDbContext _context;

        public UserRepository(ILogger logger, ApplicationDbContext context)
        {
            _logger = logger;
            _context = context;
        }

        public async Task<bool> UserExists(int userId)
        {
            try
            {
                _logger.LogInformation($"Checking if user exists with UserId: {userId}");
                var exists = await _context.Users
                    .AnyAsync(u => u.UserId == userId);

                _logger.LogInformation($"User exists check result for UserId {userId}: {exists}");
                return exists;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error checking if user exists for UserId: {userId}", ex);
                throw new DatabaseException("An error occurred while checking if the user exists.");
            }
        }

        public async Task AddUser(User user)
        {
            try
            {
                _logger.LogInformation($"Attempting to add user with email: {user.Email}");

                if (await UserExists(user.UserId))
                {
                    _logger.LogInformation($"User with email {user.Email} already exists.");
                    throw new UserAlreadyExistsException();
                }

                await _context.Users.AddAsync(user);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Successfully added user with email: {user.Email}");
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error adding user with email: {user.Email}", ex);
                throw new DatabaseException("An error occurred while adding the user.");
            }
        }

        public async Task<User> GetUserById(int userId)
        {
            try
            {
                _logger.LogInformation($"Attempting to get user by UserId: {userId}");

                var user = await _context.Users
                           .SingleOrDefaultAsync(u => u.UserId == userId)
                       ?? throw new UserNotFoundException(); 

                _logger.LogInformation($"Successfully retrieved user with UserId: {userId}");
                return user;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting user by UserId: {userId}", ex);
                throw new DatabaseException("An error occurred while retrieving the user.");
            }
        }

        public async Task<User> GetUserByEmail(string email)
        {
            try
            {
                _logger.LogInformation($"Attempting to get user by email: {email}");

                var user = await _context.Users
                    .SingleOrDefaultAsync(u => u.Email == email); 

                _logger.LogInformation($"Successfully retrieved user with email: {email}");
                return user;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting user by email: {email}", ex);
                throw new DatabaseException("An error occurred while retrieving the user.");
            }
        }

        public async Task UpdateUser(User user)
        {
            try
            {
                _logger.LogInformation($"Attempting to update user with UserId: {user.UserId}");

                _context.Users.Update(user);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Successfully updated user with UserId: {user.UserId}");
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error updating user with UserId: {user.UserId}", ex);
                throw new DatabaseException("An error occurred while updating the user.");
            }
        }
    }
}
